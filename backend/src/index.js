import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import tripsRouter from './routes/trips.js';
import destinationsRouter from './routes/destinations.js';
import { seedDestinations } from './seed.js';

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/globetrotter';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'globetrotter-api' });
});

app.use('/api/trips', tripsRouter);
app.use('/api/destinations', destinationsRouter);

async function start() {
  await mongoose.connect(MONGODB_URI);
  await seedDestinations();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GlobeTrotter API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
