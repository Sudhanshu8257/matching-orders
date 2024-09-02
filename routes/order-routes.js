import express from 'express';
import { getCompletedOrders, getPendingOrders, placeOrder } from '../controllers/orderControllers.js';
// Correct path and extension

const router = express.Router();

router.post('/order', placeOrder);
router.get('/pending', getPendingOrders);
router.get('/completed', getCompletedOrders);

export default router;
