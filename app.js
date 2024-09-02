import express from "express";
import router from "./routes/order-routes.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: true,  // Allow access from any origin
  })
);

app.use("/api/v1", router);
export default app;
