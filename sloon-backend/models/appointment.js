const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    services: { type: [String], required: true },
    totalPrice: { type: Number, required: true },  // ✅ Make sure it's a Number
    duration: { type: Number, required: true },
     isBilled: {
    type: Boolean,
    default: false
  },
    invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    default: null
  }
}, {
  timestamps: true
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
