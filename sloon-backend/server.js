const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const methodOverride = require("method-override");

// Import Models & Routes
const Appointment = require("./models/appointment"); // ✅ Model Import
const slotRoutes = require("./routes/slotRoute"); // ✅ Slots Routes Import
const serviceRoutes = require("./routes/serviceRoute"); // ✅ Services Routes Import
const appointmentRoutes = require("./routes/appointmentRoutes"); // ✅ Correct Import
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();

// ✅ Connect to MongoDB
dotenv.config(); // .env file load ho rahi hai

// ✅ Connect to MongoDB Atlas
// For Mongoose v6+ (Recommended)

const dburl = process.env.ATLASDB_URL;
console.log("Trying to connect to MongoDB Atlas...");

// Connection code
mongoose.connect(dburl)
  .then(() => console.log("✅ MongoDB Atlas se connection successful!"))
  .catch(err => {
    console.error("❌ Connection error:", err.message);
    console.log("Full error details:", err);
  });

// ✅ Set View Engine & Static Files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'https://salon-frontend-cwz0.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(methodOverride("_method"));

// ✅ Contact Form API
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  console.log("📩 New Contact Message:", { name, email, message });
  res.status(200).json({ success: true, message: "Message received successfully!" });
});

// ✅ Routes Configuration
app.use("/api/slots", slotRoutes); // All slot-related endpoints
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes); // ✅ Correct Appointment Routes Mounting

// Add preflight handler
app.options('*', cors());

// ✅ Home Route
app.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find(); // Fetch all appointments
    res.render("index", { appointments }); // Pass appointments to EJS view
  } catch (err) {
    res.status(500).send("❌ Error fetching appointments: " + err.message);
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});