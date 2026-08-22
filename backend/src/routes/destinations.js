import { Router } from 'express';
import Destination from '../models/Destination.js';

const router = Router();

router.get('/', async (_req, res) => {
  const destinations = await Destination.find().sort({ name: 1 });
  res.json(destinations);
});

router.post('/', async (req, res) => {
  const destination = await Destination.create(req.body);
  res.status(201).json(destination);
});

export default router;
