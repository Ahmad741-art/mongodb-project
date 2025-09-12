// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import employeeRoutes from "./routes/employees.js";
import articleRoutes from "./routes/articles.js";

// Load env variables
dotenv.config({ path: "./config.env" });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.ATLAS_URI;
if (!uri) {
  console.error("❌ MongoDB connection error: ATLAS_URI is undefined");
  process.exit(1);
}

mongoose.connect(uri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/articles", articleRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
