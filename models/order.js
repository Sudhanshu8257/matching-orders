import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderType: { type: String, required: true, enum: ['buy', 'sell'] },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: 'open', enum: ['open', 'filled', 'partially_filled', 'canceled'] },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
