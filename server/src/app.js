import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.js";
import healthRouter from "./routes/health.js";
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
  app.use("/api/v1/trips", tripsRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found", path: req.path });
  });

  app.use(errorHandler);

  return app;
}
