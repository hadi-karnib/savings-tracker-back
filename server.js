// index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

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

// Test route
app.get("/", (req, res) => {
  res.cookie("token", "dummy", { httpOnly: true }); // Example cookie
  res.send("Hello from Express + ES Modules!");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
