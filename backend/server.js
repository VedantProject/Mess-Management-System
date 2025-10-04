require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { startAutoExitScheduler } = require("./utils/scheduler");

// Import routes
const authRoutes = require("./routes/auth");
const qrRoutes = require("./routes/qr");
const attendanceRoutes = require("./routes/attendance");
const userRoutes = require("./routes/users");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Start auto-exit scheduler
startAutoExitScheduler();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});
