const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const methodOverride = require("method-override");

// Import Models & Routes
const Appointment = require("./models/appointment");
const slotRoutes = require("./routes/slotRoute");
const serviceRoutes = require("./routes/serviceRoute");
const appointmentRoutes = require("./routes/appointmentRoutes");
const authRoutes = require("./routes/auth");

// Load environment variables
dotenv.config();

const app = express();

// MongoDB Atlas Connection - Modern Configuration
const dburl = process.env.ATLASDB_URL;
console.log("Trying to connect to MongoDB Atlas...");

const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // 10 seconds timeout
  retryWrites: true
};

mongoose.connect(dburl, mongooseOptions)
  .then(() => console.log("✅ MongoDB Atlas connection successful!"))
  .catch(err => {
    console.error("❌ MongoDB connection failed:");
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("Full error stack:", err.stack);
    process.exit(1); // Exit if DB connection fails
  });

// Enhanced CORS Configuration
const allowedOrigins = [
  'https://salon-frontend-cwz0.onrender.com',
  'http://localhost:5173'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/slots", slotRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);

// Contact Form API with validation
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }
  console.log("📩 New Contact Message:", { name, email, message });
  res.status(200).json({ success: true, message: "Message received successfully!" });
});

// Home Route with error handling
app.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().lean();
    res.render("index", { appointments });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).render("error", { message: "Failed to load appointments" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🚨 Error:", err.stack);
  res.status(500).json({ 
    error: "Internal Server Error",
    message: err.message 
  });
});

// Server startup
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🛡️ CORS allowed for origins: ${allowedOrigins.join(', ')}`);
});