const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// Load env
dotenv.config();

// Connect DB
connectDB();

const app = express();

// Middleware
app.use(express.json());

// ✅ CORS (allow frontend later)
app.use(cors({
  origin: "*", // later replace with your Vercel URL
}));

// ✅ Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ ROOT ROUTE (FIXES "Cannot GET /")
app.get("/", (req, res) => {
  res.send("🚀 Needo Backend is Running Successfully");
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/donations", require("./routes/donations"));
app.use("/api/accept", require("./routes/accept"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/admin", require("./routes/admin"));

// ✅ 404 Handler (clean API response)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});