import mongoose from 'mongoose';

const completedOrderSchema = new mongoose.Schema({
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  matchedAt: { type: Date, default: Date.now }
});

const CompletedOrder = mongoose.model('CompletedOrder', completedOrderSchema);

export default CompletedOrder;
