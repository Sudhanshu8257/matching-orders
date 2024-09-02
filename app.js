import express from "express";
import router from "./routes/order-routes.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true
}));

app.use("/api/v1", router);
export default app;
