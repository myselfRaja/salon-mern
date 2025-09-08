const Appointment = require("../models/appointment");
const sendConfirmationEmail = require("../utils/emailServices");
const Invoice = require("../models/invoice"); 

// 1️⃣ CREATE APPOINTMENT
exports.createAppointment = async (req, res) => {
    try {
        
        const { name, phone, email, date, time, services, totalPrice } = req.body;

        // 🛡️ Validation
        if (!name || !phone || !email || !date || !time || !services || !totalPrice) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: "Invalid date format! Use YYYY-MM-DD" });
        }

        const now = new Date();
        const selectedDateTime = new Date(`${date}T${time}`);
        if (selectedDateTime < now) {
            return res.status(400).json({ message: "You cannot select a past date/time." });
        }

        // ⏱️ Duration Calculation
        let totalDuration = 0;
        services.forEach(serviceStr => {
            const durationMatch = serviceStr.match(/\((\d+)\s*mins\)/);
            if (durationMatch) totalDuration += parseInt(durationMatch[1]);
        });

        // 🕒 Conflict Check
        const selectedStart = new Date(`${date}T${time}`);
        const selectedEnd = new Date(selectedStart.getTime() + totalDuration * 60000);
        const appointmentsOnDate = await Appointment.find({ date });

        const hasConflict = appointmentsOnDate.some(app => {
            const appStart = new Date(`${app.date}T${app.time}`);
            const appEnd = new Date(appStart.getTime() + app.duration * 60000);
            return (selectedStart < appEnd && selectedEnd > appStart);
        });

        if (hasConflict) {
            return res.status(400).json({ 
                message: "This slot overlaps with another appointment. Please choose another time." 
            });
        }

        // 🎟️ Token Generation
        const lastAppointment = await Appointment.findOne().sort({ token: -1 });
        const tokenNumber = lastAppointment ? lastAppointment.token + 1 : 1;

        // 💾 Save to DB
        const newAppointment = new Appointment({
            name, phone, email, date, time, services, 
            totalPrice, duration: totalDuration, token: tokenNumber
        });
        await newAppointment.save();
        

        const count = await Appointment.countDocuments();


        // ✉️ Send Email
        // await sendConfirmationEmail(email, name, date, time, services, totalPrice, tokenNumber);
        

        //socket.io
const io = req.app.get("io");   // ✅ socket instance
if (io) {
    io.emit("slotsUpdated", { date });  // ✅ notify all connected clients
   
}
        res.status(201).json({ 
            message: "Appointment booked successfully!", 
            appointment: { id: newAppointment._id, token: tokenNumber, date, time, services, totalPrice }
        });

    } catch (error) {
        console.error("❌ Appointment Error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", error: error.message });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// 2️⃣ GET ALL APPOINTMENTS
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().populate("invoice");
        
        // ✅ SAHI CODE - appointmentsWithInvoice ki jagah appointments use karo
        
        
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: "Error fetching appointments", message: err.message });
    }
};

// 3️⃣ UPDATE APPOINTMENT
exports.updateAppointment = async (req, res) => {
    try {
        const { name, date, time } = req.body;
        const existingAppointment = await Appointment.findOne({
            date, time, _id: { $ne: req.params.id }
        });

        if (existingAppointment) {
            return res.status(400).json({ error: "This slot is already booked. Choose another time." });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { name, date, time },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        // 🔔 Real-time update via Socket.IO
const io = req.app.get("io");
if (io) {
    io.emit("slotsUpdated", { date });

}


        res.status(200).json(updatedAppointment);
    } catch (err) {
        res.status(500).json({ error: "Error updating appointment", message: err.message });
    }
};

// 4️⃣ DELETE APPOINTMENT
exports.deleteAppointment = async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        // 🔔 Real-time update via Socket.IO
const io = req.app.get("io");
if (io) {
    io.emit("slotsUpdated", { date: deletedAppointment.date });
    console.log("📢 Emitted slotsUpdated event for date (delete):", deletedAppointment.date);
}

        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting appointment", message: err.message });
    }
};

exports.generateInvoice = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // agar already invoice hai to return kar do
        if (appointment.invoice) {
            return res.status(400).json({ message: "Invoice already generated" });
        }

        // naya invoice banao
        const invoice = new Invoice({
            appointment: appointment._id,
            customerName: appointment.name,
            services: appointment.services,
            totalPrice: appointment.totalPrice,
            date: appointment.date,
        });
        await invoice.save();

        // appointment me invoice id store karo
        appointment.invoice = invoice._id;
        await appointment.save();

        res.status(201).json({ message: "Invoice generated", invoice });
    } catch (err) {
        res.status(500).json({ error: "Error generating invoice", message: err.message });
    }
};