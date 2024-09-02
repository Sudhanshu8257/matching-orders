import express from 'express';
import { clearOrders, getCompletedOrders, getPendingOrders, placeOrder } from '../controllers/orderControllers.js';
// Correct path and extension

const router = express.Router();

router.post('/order', placeOrder);
router.get('/pending', getPendingOrders);
router.get('/completed', getCompletedOrders);
router.delete('/clear' , clearOrders)

export default router;
