import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import aiRouter from "./routes/ai.js";
import assistantRouter from "./routes/assistant.js";
import authRouter from "./routes/auth.js";
import expensesRouter from "./routes/expenses.js";
import healthRouter from "./routes/health.js";
import odooRouter from "./routes/odoo.js";
import publicRouter from "./routes/public.js";
import searchRouter from "./routes/search.js";
import stopActivitiesRouter from "./routes/stopActivities.js";
import stopsRouter from "./routes/stops.js";
import tripsRouter from "./routes/trips.js";

export function createApp() {
  const app = express();
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  app.use(
    cors({
      origin: clientUrl,
    }),
  );
  app.use(express.json());

  app.use("/api", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/ai", aiRouter);
  app.use("/api/v1/assistant", assistantRouter);
  app.use("/api/v1/odoo", odooRouter);
  app.use("/api/v1/public", publicRouter);
  app.use("/api/v1/trips", tripsRouter);
  app.use("/api/v1/expenses", expensesRouter);
  app.use("/api/v1/stops", stopsRouter);
  app.use("/api/v1/stop-activities", stopActivitiesRouter);
  app.use("/api/v1/search", searchRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found", path: req.path });
  });

  app.use(errorHandler);

  return app;
}
