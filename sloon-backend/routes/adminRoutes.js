const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("./models/Admin");
const { getAllUsers, updateUser, deleteUser, getAllAppointments } = require("./controllers/adminController");
const authenticateAdmin = require("./middleware/auth");

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, "your_secret_key", { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin Dashboard Routes
router.get("/users", authenticateAdmin, getAllUsers); // Get all users
router.put("/users/:id", authenticateAdmin, updateUser); // Update a user
router.delete("/users/:id", authenticateAdmin, deleteUser); // Delete a user
router.get("/appointments", authenticateAdmin, getAllAppointments); // Get all appointments

module.exports = router;