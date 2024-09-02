import mongoose from 'mongoose';

const pendingOrderSchema = new mongoose.Schema({
  orderType: { type: String, required: true, enum: ['buy', 'sell'] },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PendingOrder = mongoose.model('PendingOrder', pendingOrderSchema);

export default PendingOrder;
