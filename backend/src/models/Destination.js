import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  tags: [{ type: String }],
});

export default mongoose.model('Destination', destinationSchema);
