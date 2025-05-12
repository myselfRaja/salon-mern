const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointment");

// ✅ Fetch Available Slots
router.get("/available-slots", async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ message: "Date is required!" });
        }

        // ✅ Validate Date Format
        if (new Date(date).toISOString().split("T")[0] !== date) {
            return res.status(400).json({ message: "Invalid date format! Use YYYY-MM-DD" });
        }

        const openingTime = 10 * 60; // ✅ 10:00 AM (600 minutes)
        const closingTime = 21 * 60; // ✅ 9:00 PM (1260 minutes)

        console.log(`🕒 Checking available slots for Date: ${date}`);
        console.log(`⏳ Salon Timing: 10:00 AM to 9:00 PM`);

        // ✅ Database se booked appointments le rahe hain
        const bookedAppointments = await Appointment.find({ date });

        console.log("📌 Booked Appointments:", bookedAppointments);

        let bookedSlots = [...new Set(bookedAppointments.map(appt => {
            if (!appt.time) {
                console.log("⚠️ Skipping invalid appointment:", appt);
                return null;
            }
            const [hours, minutes] = appt.time.split(":").map(Number);
            const totalMinutes = hours * 60 + minutes;
            return isNaN(totalMinutes) ? null : totalMinutes;
        }).filter(Boolean))];

        console.log("📌 Normalized Booked Slots (Minutes):", bookedSlots);

        let availableSlots = [];

        for (let time = openingTime; time < closingTime; time += 30) {
            const hours = Math.floor(time / 60);
            const minutes = time % 60;
            const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

            console.log(`⏳ Checking slot: ${formattedTime}`);

            if (!bookedSlots.includes(time)) {
                availableSlots.push(formattedTime);
            } else {
                console.log(`🚫 Slot ${formattedTime} is already booked.`);
            }
        }

        console.log("✅ Available Slots Before Sending:", availableSlots);
        res.json({ availableSlots });

    } catch (error) {
        console.error("❌ Error fetching available slots:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
