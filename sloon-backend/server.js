const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const methodOverride = require("method-override");

// ✅ Add these for Socket.IO
const http = require("http");
const { Server } = require("socket.io");

// Import Models & Routes
const Appointment = require("./models/appointment");
const slotRoutes = require("./routes/slotRoute");
const serviceRoutes = require("./routes/serviceRoute");
const appointmentRoutes = require("./routes/appointmentRoutes");
const authRoutes = require("./routes/auth");
const invoiceRoutes = require('./routes/invoiceRoutes');
const salonConfigRoutes = require('./routes/salonConfigRoutes');

// Load environment variables
dotenv.config();

const app = express();

// ✅ Create HTTP server from Express
const server = http.createServer(app);

// ✅ Setup Socket.IO with CORS
const allowedOrigins = [
  'https://salon-frontend-cwz0.onrender.com',
  'http://localhost:5173'
];

const io = new Server(server, {
  cors: {
    origin:'https://salon-frontend-cwz0.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
    transports: ["websocket", "polling"], 
});

// ✅ Make io available in routes
app.set("io", io);

// ✅ Handle socket connections
io.on("connection", (socket) => {
 

  socket.emit("welcome", { message: "Socket server connected successfully 🚀" });

  socket.on("disconnect", () => {
   
  });
});

// -------------------- MongoDB Connection --------------------
const dburl = process.env.ATLASDB_URL || 'mongodb://localhost:27017/salon';
console.log("Trying to connect to MongoDB Atlas...");

const mongooseOptions = {
  serverSelectionTimeoutMS: 10000,
  retryWrites: true,
  dbName: 'salon'
};




mongoose.connect(dburl, mongooseOptions)
  .then(() => {
   
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:");
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    
    // ✅ Fallback to local database agar Atlas connection fail ho
    if (dburl.includes('atlas') || dburl.includes('render')) {
    
      const localDBURL = 'mongodb://localhost:27017/salon';
      
      mongoose.connect(localDBURL, mongooseOptions)
        .then(() => {
          console.log("✅ Local MongoDB connection successful!");
        })
        .catch(localErr => {
          console.error("❌ Local MongoDB also failed:");
          console.error(localErr.message);
          process.exit(1);
        });
    } else {
      process.exit(1);
    }
  });

// -------------------- Middleware --------------------
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// -------------------- Routes --------------------
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

app.use("/api/slots", slotRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/salon-config', salonConfigRoutes);

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }
  console.log("📩 New Contact Message:", { name, email, message });
  res.status(200).json({ success: true, message: "Message received successfully!" });
});

app.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().lean();
    res.render("index", { appointments });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).render("error", { message: "Failed to load appointments" });
  }
});

// -------------------- Error Handling --------------------
app.use((err, req, res, next) => {
  console.error("🚨 Error:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

// -------------------- Server Startup --------------------
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
 
});
