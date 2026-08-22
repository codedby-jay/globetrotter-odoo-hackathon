import cors from "cors";
import express from "express";
import healthRouter from "./routes/health.js";

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

  app.use((req, res) => {
    res.status(404).json({ error: "Not found", path: req.path });
  });

  return app;
}
