import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  date: { type: String, required: true },
  cost: { type: Number, default: 0 },
  notes: { type: String, default: '' },
});

const tripSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    cities: [{ type: String }],
    budget: { type: Number, default: 0 },
    activities: [activitySchema],
    shared: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);
