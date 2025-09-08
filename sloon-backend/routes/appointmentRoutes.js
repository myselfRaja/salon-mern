const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  updateAppointment,
  deleteAppointment,
   generateInvoice 
} = require("../controllers/AppointmentController");
const authMiddleware = require("../middleware/authMiddleware");

// 🔓 Public Route (No auth needed)
router.post("/", createAppointment); 

// 🔐 Protected Routes (Auth required)
router.get("/", authMiddleware, getAllAppointments);
router.put("/:id", authMiddleware, updateAppointment);
router.delete("/:id", authMiddleware, deleteAppointment);

module.exports = router;