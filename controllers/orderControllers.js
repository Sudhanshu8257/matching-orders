import mongoose from "mongoose";
import PendingOrder from "../models/pending-order.js";
import CompletedOrder from "../models/completed-order.js";
import PriorityQueue from "priorityqueuejs";

// Place a new order and match with existing orders
export const placeOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderType, quantity, price } = req.body;

    // Validate input
    if (!orderType || !quantity || !price) {
      const error = new Error(
        "All fields are required: orderType, quantity, price"
      );
      error.statusCode = 400;
      throw error;
    }

    const newOrder = new PendingOrder({ orderType, quantity, price });
    await newOrder.save({ session });

    const { matched, isPartial } = await matchOrders(session);

    await session.commitTransaction();
    session.endSession();

    if (matched) {
      res.status(201).json({
        success: true,
        message: isPartial
          ? "Order partially matched and completed successfully."
          : "Order matched and completed successfully.",
      });
    } else {
      res.status(201).json({
        success: true,
        message: "Order placed successfully.",
      });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// Matching logic for orders using priority queues
const matchOrders = async (session) => {
  const buyQueue = new PriorityQueue(
    (a, b) => b.price - a.price || a.createdAt - b.createdAt
  );
  const sellQueue = new PriorityQueue(
    (a, b) => a.price - b.price || a.createdAt - b.createdAt
  );

  const buyOrders = await PendingOrder.find({ orderType: "buy" }).session(session);
  const sellOrders = await PendingOrder.find({ orderType: "sell" }).session(session);

  buyOrders.forEach((order) => buyQueue.enq(order));
  sellOrders.forEach((order) => sellQueue.enq(order));

  let matched = false;
  let isPartial = false;

  while (!buyQueue.isEmpty() && !sellQueue.isEmpty()) {
    const buyOrder = buyQueue.peek();
    const sellOrder = sellQueue.peek();

    if (!buyOrder || !sellOrder || buyOrder.quantity <= 0 || sellOrder.quantity <= 0) {
      break;
    }

    if (buyOrder.price >= sellOrder.price) {
      const tradeQty = Math.min(buyOrder.quantity, sellOrder.quantity);

      buyOrder.quantity -= tradeQty;
      sellOrder.quantity -= tradeQty;

      const newCompletedOrder = new CompletedOrder({
        price: sellOrder.price,
        quantity: tradeQty,
        matchedAt: new Date(),
      });
      await newCompletedOrder.save({ session });

      matched = true;
      isPartial = isPartial || buyOrder.quantity > 0 || sellOrder.quantity > 0;

      if (buyOrder.quantity === 0) {
        await PendingOrder.deleteOne({ _id: buyOrder._id }).session(session);
        buyQueue.deq();
      } else {
        await PendingOrder.updateOne(
          { _id: buyOrder._id },
          { quantity: buyOrder.quantity },
          { session }
        );
        buyQueue.deq();
        buyQueue.enq(buyOrder); 
      }

      if (sellOrder.quantity === 0) {
        await PendingOrder.deleteOne({ _id: sellOrder._id }).session(session);
        sellQueue.deq();
      } else {
        await PendingOrder.updateOne(
          { _id: sellOrder._id },
          { quantity: sellOrder.quantity },
          { session }
        );
        sellQueue.deq();
        sellQueue.enq(sellOrder);  
      }
    } else {
      break; 
    }
  }

  return { matched, isPartial };
};

// Get all completed orders
export const getCompletedOrders = async (req, res, next) => {
  try {
    const completedOrders = await CompletedOrder.find();
    res.status(200).json({ success: true, data: completedOrders });
  } catch (error) {
    next(error);
  }
};

// Get all pending orders
export const getPendingOrders = async (req, res, next) => {
  try {
    const pendingOrders = await PendingOrder.find({ quantity: { $gt: 0 } });
    res.status(200).json({ success: true, data: pendingOrders });
  } catch (error) {
    next(error);
  }
};

/* 
  Priority Queue Usage in Order Matching System:

  1. Efficient Order Matching:
     - A priority queue allows us to efficiently manage and retrieve orders based on their priority.
     - In the context of a trading platform, orders need to be matched based on price priorities:
       - Buy orders with higher prices should be prioritized.
       - Sell orders with lower prices should be prioritized.

  2. Order Prioritization:
     - We use two priority queues:
       - `buyQueue`: A max-heap that prioritizes buy orders with higher prices first. If two buy orders have the same price, the order that arrived earlier is prioritized.
       - `sellQueue`: A min-heap that prioritizes sell orders with lower prices first. If two sell orders have the same price, the order that arrived earlier is prioritized.
     - The priority queues are initialized with a comparator function to enforce this prioritization logic.

  3. Adding Orders to the Queue:
     - Pending buy and sell orders are fetched from the database and added to their respective priority queues (`buyQueue` and `sellQueue`).
     - This setup ensures that when orders are matched, they are matched in the most optimal order according to the platform's rules.

  4. Order Matching Using Priority Queues:
     - The `matchOrders` function continuously checks the top elements of both queues (the highest-priority orders) to see if a match is possible.
     - If a match is possible (buy price >= sell price), the orders are partially or fully matched based on their quantities.
     - If an order is fully matched (quantity becomes zero), it is removed from the queue and deleted from the database.
     - If an order is partially matched, its quantity is updated, and it is re-enqueued in the priority queue to maintain the correct order priority.

  5. Re-queuing Partially Filled Orders:
     - Partially filled orders are removed from the queue and then re-enqueued with the updated quantity.
     - This ensures that partially filled orders are still eligible for future matches, but now with the updated quantities.
  
  6. Optimized Performance:
     - Using priority queues allows the system to quickly and efficiently match orders based on the most up-to-date and optimal priorities.
     - This results in a high-performance order matching engine that adheres to the rules of price-time priority commonly used in trading platforms.
*/
