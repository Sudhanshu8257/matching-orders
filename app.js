import express from "express";
import router from "./routes/order-routes.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3001","https://orders-chart.vercel.app/"],
  })
);

app.use("/api/v1", router);
export default app;
