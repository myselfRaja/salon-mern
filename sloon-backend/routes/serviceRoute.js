const express = require("express");
const router = express.Router();

// 🔹 Available Services with duration & price
const services = {
    haircut: { duration: 30, price: 500 },
    spa: { duration: 45, price: 1000 },
    facial: { duration: 15, price: 300 },
};

// ✅ Calculate Total Price
// ✅ Calculate Total Price and Duration
router.get("/calculate-price", (req, res) => {
    const { selectedServices } = req.query;

    if (!selectedServices) {
        return res.status(400).json({ message: "No services selected!" });
    }

    let totalPrice = 0;
    let totalDuration = 0;

    const selectedServicesArray = selectedServices.split(",");

    selectedServicesArray.forEach(service => {
        if (services[service]) {
            totalPrice += services[service].price;
            totalDuration += services[service].duration;
        }
    });

    res.json({ totalPrice, totalDuration });
});

module.exports = router;
module.exports.services = services;
