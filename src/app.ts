import express, { type Application } from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Health Check (Good practice for cloud deployments)
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "UP", message: "AI Support Agent Server is running" });
});

// Routes
app.use("/api", chatRoutes);

export default app;
