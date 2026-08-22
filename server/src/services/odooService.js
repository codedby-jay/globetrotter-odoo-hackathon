import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { getOdooConfig } from "../config/odoo.js";
import { createOdooClient } from "../providers/odooClient.js";
import { getTrip, requireOwnedTrip } from "./tripService.js";
import { ODOO_MODEL_STRATEGIES } from "./odooMapper.js";

const ALLOWED_MODELS = new Set(ODOO_MODEL_STRATEGIES.map((item) => item.model));

function statusPayload(configured, connected, message) {
  return { configured, connected, message };
}

export async function getOdooStatus() {
  const config = getOdooConfig();
  if (!config.configured) {
    return statusPayload(false, false, "Odoo is not configured");
  }

  try {
    await testConnection();
    return statusPayload(true, true, "Odoo connection successful");
  } catch (err) {
    if (err instanceof HttpError && err.status === 502) {
      return statusPayload(true, false, err.message);
    }
    throw err;
  }
}

export async function testConnection() {
  const config = getOdooConfig();
  if (!config.configured) {
    throw new HttpError(400, "Odoo is not configured");
  }

  const client = createOdooClient(config);
  await client.version();
  const uid = await client.authenticate();
  return {
    configured: true,
    connected: true,
    message: "Odoo connection successful",
    uid,
  };
}

export async function testTripExport(tripId, userId) {
  await requireOwnedTrip(tripId, userId);
  await getTrip(userId, tripId);
  const connection = await testConnection();
  return {
    configured: true,
    connected: true,
    message: "This trip can be exported to Odoo",
    uid: connection.uid,
  };
}

function isAccessOrMissingModel(err) {
  return err instanceof HttpError && err.status === 502;
}

async function tryCreate(client, strategy, trip) {
  try {
    const id = await client.create(strategy.model, strategy.values(trip));
    return Number(id);
  } catch (err) {
    if (!isAccessOrMissingModel(err)) {
      throw err;
    }
    try {
      const id = await client.create(strategy.model, strategy.fallbackValues(trip));
      return Number(id);
    } catch (inner) {
      if (!isAccessOrMissingModel(inner)) {
        throw inner;
      }
      return null;
    }
  }
}

async function tryWrite(client, model, recordId, strategy, trip) {
  if (!ALLOWED_MODELS.has(model)) {
    return false;
  }
  try {
    await client.write(model, [recordId], strategy.values(trip));
    return true;
  } catch (err) {
    if (!isAccessOrMissingModel(err)) {
      throw err;
    }
    try {
      await client.write(model, [recordId], strategy.fallbackValues(trip));
      return true;
    } catch (inner) {
      if (!isAccessOrMissingModel(inner)) {
        throw inner;
      }
      return false;
    }
  }
}

export async function exportTrip(tripId, userId) {
  return syncTrip(tripId, userId);
}

export async function syncTrip(tripId, userId) {
  await requireOwnedTrip(tripId, userId);
  const trip = await getTrip(userId, tripId);

  const config = getOdooConfig();
  if (!config.configured) {
    throw new HttpError(400, "Odoo is not configured");
  }

  const client = createOdooClient(config);
  await client.authenticate();

  const stored = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { odooExpenseId: true },
  });
  const existingId = stored?.odooExpenseId ?? null;
  if (existingId) {
    for (const strategy of ODOO_MODEL_STRATEGIES) {
      const updated = await tryWrite(client, strategy.model, existingId, strategy, trip);
      if (updated) {
        return {
          success: true,
          message: "Trip exported to Odoo",
          odoo: {
            model: strategy.model,
            recordId: existingId,
          },
        };
      }
    }
  }

  for (const strategy of ODOO_MODEL_STRATEGIES) {
    const recordId = await tryCreate(client, strategy, trip);
    if (Number.isInteger(recordId) && recordId > 0) {
      await prisma.trip.update({
        where: { id: tripId },
        data: { odooExpenseId: recordId },
      });
      return {
        success: true,
        message: "Trip exported to Odoo",
        odoo: {
          model: strategy.model,
          recordId,
        },
      };
    }
  }

  throw new HttpError(
    502,
    "Odoo is unavailable or none of the supported standard models could accept this trip",
  );
}
