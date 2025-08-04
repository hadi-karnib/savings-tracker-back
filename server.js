// index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json()); // Parses application/json
app.use(express.urlencoded({ extended: true })); // Parses x-www-form-urlencoded
app.use(morgan("dev")); // Logs HTTP requests

const PORT = process.env.PORT || 4000;

app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
connectDB();
