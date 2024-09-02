import express from "express";
import router from "./routes/order-routes.js";
import cors from "cors";

const app = express();
const corsConfig = {
  credentials: true,
  origin: ["http://localhost:3000", "https://orders-chart.vercel.app/"],
};
app.use(express.json());
app.use(cors(corsConfig));

app.use("/api/v1", router);
export default app;
