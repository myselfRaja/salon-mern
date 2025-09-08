// AppointmentForm.jsx
import React, { useState, useEffect } from "react";
import ServiceSelection from "./ServiceSelection";
import { io } from "socket.io-client";

import BookingForm from "./BookingForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AppointmentForm.css";

// Helper functions (temporary - baad mein helpers.js mein shift karenge)
// ✅ BACKEND URL WITH ENVIRONMENT VARIABLE
const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const isSameDay = (date1, date2) => date1.toDateString() === date2.toDateString();
const isTimeAfter = (slotTime, currentTime) => {
  const [slotH, slotM] = slotTime.split(':').map(Number);
  const [currentH, currentM] = [currentTime.getHours(), currentTime.getMinutes()];
  return slotH > currentH || (slotH === currentH && slotM > currentM);
};
const services = [
  { id: 1, name: "Haircut", duration: 30, price: 200 },
  { id: 2, name: "Facial", duration: 45, price: 400 },
  { id: 3, name: "Massage", duration: 60, price: 500 }
];

const AppointmentForm = ({ onAdd }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
     const newSocket = io(backendURL, {
      transports: ["websocket", "polling"], // fast connection
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("⚡ Connected to socket server:", newSocket.id);
    });

    newSocket.on("welcome", (msg) => {
      console.log("✅ Server says:", msg);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [backendURL]);

  // State Variables
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    date: null, 
    time: "" 
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);

  // Service Selection Handler
  const handleServiceSelect = (service) => {
    setSelectedServices(prev => 
      prev.some(s => s.id === service.id) 
        ? prev.filter(s => s.id !== service.id) 
        : [...prev, service]
    );
  };

  // Proceed to Booking
  const proceedToBooking = () => {
    if(selectedServices.length === 0) {
      setErrors({ services: "Please select at least one service" });
      return;
    }
    setTotalPrice(selectedServices.reduce((sum, s) => sum + s.price, 0));
    setStep(2);
  };

  // Date Change Handler
  const handleDateChange = (date) => {
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    setFormData({ ...formData, date: localDate, time: "" });
  };

  // Fetch Available Slots
   // ✅ Listen for available slots from socket
useEffect(() => {
  if (!formData.date || step !== 2 || !socket) return;

  const dateStr = formData.date.toISOString().split("T")[0];

  // 🔹 API call (initial fetch)
fetch(`${backendURL}/api/slots/available-slots?date=${dateStr}`)
    .then((res) => res.json())
    .then((data) => {
      const now = new Date();

      const filteredSlots = isSameDay(formData.date, now)
        ? data.availableSlots
            .filter((slot) => isTimeAfter(slot, now)) // ✅ past slots hide
            .filter((slot, idx, arr) => arr.indexOf(slot) === idx) // ✅ duplicates remove
        : data.availableSlots;

      console.log("🎯 Final Available Slots (API):", filteredSlots);
      setAvailableSlots(filteredSlots);
    })
    .catch((err) => console.error("❌ Error fetching slots:", err));

  // 🔔 Socket listener (real-time updates)
  socket.on("slotsUpdated", (data) => {
    const now = new Date();

    const filteredSlots = isSameDay(formData.date, now)
      ? data.availableSlots
          .filter((slot) => isTimeAfter(slot, now)) // ✅ past slots hide
          .filter((slot, idx, arr) => arr.indexOf(slot) === idx) // ✅ duplicates remove
      : data.availableSlots;

    console.log("⚡ Final Available Slots (Socket):", filteredSlots);
    setAvailableSlots(filteredSlots);
  });

  return () => {
    socket.off("slotsUpdated");
  };
}, [formData.date, step, socket, backendURL]);





  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const bookingData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        date: formData.date.toISOString().split('T')[0],
        time: formData.time,
        services: selectedServices.map(s => `${s.name} (${s.duration} mins) - ₹${s.price}`),
        totalPrice: totalPrice,
        duration: selectedServices.reduce((sum, s) => sum + s.duration, 0)
      };

     const response = await fetch(`${backendURL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) throw new Error("Booking failed");
      
      // Reset form
      setStep(1);
      setSelectedServices([]);
      setFormData({ name: "", phone: "", email: "", date: null, time: "" });
     toast.success("🎉 Booking successful!");
    } catch (error) {
      toast.error(`❌ Booking failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-form">
      {step === 1 ? (
        <ServiceSelection
          services={services}
          selectedServices={selectedServices}
          onServiceSelect={handleServiceSelect}
          onProceed={proceedToBooking}
          error={errors.services}
        />
      ) : (
        <BookingForm
          selectedServices={selectedServices}
          totalPrice={totalPrice}
          formData={formData}
          availableSlots={availableSlots}
          loading={loading}
          onFieldChange={(field, value) => setFormData({...formData, [field]: value})}
          onDateChange={handleDateChange}
          onTimeChange={time => setFormData({...formData, time})}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
        />
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AppointmentForm;