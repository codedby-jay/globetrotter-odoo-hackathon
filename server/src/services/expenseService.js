import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { dateOnly, money, toDate } from "../lib/dates.js";
import { serializeExpense } from "../lib/serialize.js";
import { requireOwnedTrip } from "./tripService.js";

const CATEGORIES = ["TRANSPORT", "STAY", "ACTIVITY", "MEALS", "OTHER"];

// TripExpense rows are the source of truth for budget totals.
// Stop.stayCost / Stop.transportCost and StopActivity.cost stay on the itinerary
// and are NOT auto-copied or double-counted here. Manual expenses only.

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function descriptionFrom(input) {
  const value = input.description ?? input.label;
  if (value == null) {
    return undefined;
  }
  return value;
}

function expenseDateFrom(input) {
  return input.expenseDate ?? input.incurredOn;
}

async function getOwnedTripRecord(tripId, userId) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
  });
  if (!trip) {
    throw new HttpError(404, "Trip not found");
  }
  if (trip.ownerId !== userId) {
    throw new HttpError(403, "Forbidden");
  }
  return trip;
}

async function getOwnedExpense(expenseId, userId) {
  const expense = await prisma.tripExpense.findUnique({
    where: { id: expenseId },
    include: { trip: true },
  });
  if (!expense) {
    throw new HttpError(404, "Expense not found");
  }
  if (expense.trip.ownerId !== userId) {
    throw new HttpError(403, "Forbidden");
  }
  return expense;
}

function assertCurrency(trip, currency) {
  if (!currency) {
    return;
  }
  if (currency !== trip.currency) {
    throw new HttpError(400, "Expense currency must match the trip currency");
  }
}

export async function createExpense(userId, tripId, input) {
  const trip = await getOwnedTripRecord(tripId, userId);
  assertCurrency(trip, input.currency);

  const label = descriptionFrom(input);
  const expenseDate = expenseDateFrom(input);

  const expense = await prisma.tripExpense.create({
    data: {
      tripId: trip.id,
      category: input.category,
      label,
      amount: input.amount,
      incurredOn: toDate(expenseDate),
    },
  });

  return serializeExpense(expense, trip.currency);
}

export async function listExpenses(userId, tripId) {
  const trip = await getOwnedTripRecord(tripId, userId);
  const expenses = await prisma.tripExpense.findMany({
    where: { tripId: trip.id },
    orderBy: [{ incurredOn: "desc" }, { id: "desc" }],
  });
  return expenses.map((expense) => serializeExpense(expense, trip.currency));
}

export async function updateExpense(userId, expenseId, input) {
  const current = await getOwnedExpense(expenseId, userId);
  assertCurrency(current.trip, input.currency);

  const label = descriptionFrom(input);
  const expenseDate = expenseDateFrom(input);

  const expense = await prisma.tripExpense.update({
    where: { id: expenseId },
    data: {
      category: input.category ?? undefined,
      label: label === undefined ? undefined : label,
      amount: input.amount === undefined ? undefined : input.amount,
      incurredOn:
        expenseDate === undefined
          ? undefined
          : expenseDate === null
            ? null
            : toDate(expenseDate),
    },
  });

  return serializeExpense(expense, current.trip.currency);
}

export async function deleteExpense(userId, expenseId) {
  await getOwnedExpense(expenseId, userId);
  await prisma.tripExpense.delete({ where: { id: expenseId } });
  return { message: "Expense deleted" };
}

export async function getBudgetSummary(userId, tripId) {
  await requireOwnedTrip(tripId, userId);
  const trip = await getOwnedTripRecord(tripId, userId);
  const expenses = await prisma.tripExpense.findMany({
    where: { tripId: trip.id },
  });

  const categories = Object.fromEntries(CATEGORIES.map((key) => [key, 0]));
  let totalSpent = 0;
  for (const expense of expenses) {
    const amount = money(expense.amount) ?? 0;
    totalSpent += amount;
    if (categories[expense.category] != null) {
      categories[expense.category] += amount;
    } else {
      categories.OTHER += amount;
    }
  }

  totalSpent = roundMoney(totalSpent);
  for (const key of CATEGORIES) {
    categories[key] = roundMoney(categories[key]);
  }

  const budget = roundMoney(money(trip.budgetLimit) ?? 0);
  const remaining = roundMoney(budget - totalSpent);
  const percentageUsed =
    budget > 0 ? roundMoney((totalSpent / budget) * 100) : totalSpent > 0 ? 100 : 0;
  const overBy = remaining < 0 ? roundMoney(Math.abs(remaining)) : 0;

  return {
    tripId: trip.id,
    budget,
    budgetLimit: budget,
    currency: trip.currency,
    totalSpent,
    remaining,
    percentageUsed,
    overBudget: remaining < 0,
    overBy,
    categories,
  };
}
