// AppointmentForm.jsx
import React, { useState, useEffect } from "react";
import ServiceSelection from "./ServiceSelection";
import BookingForm from "./BookingForm";
import "./AppointmentForm.css";

// Helper functions (temporary - baad mein helpers.js mein shift karenge)
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
  useEffect(() => {
    if (!formData.date || step !== 2) return;
    
    const fetchSlots = async () => {
      try {
        const dateStr = formData.date.toISOString().split('T')[0];
        const response = await fetch(`https://salon-backend-qnkh.onrender.com/api/slots/available-slots?date=${dateStr}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || "Failed to fetch slots");
        
        const now = new Date();
        setAvailableSlots(
          isSameDay(formData.date, now) 
            ? data.availableSlots.filter(slot => isTimeAfter(slot, now)) 
            : data.availableSlots
        );
      } catch (error) {
        console.error("Slot Error:", error);
        setAvailableSlots([]);
        alert("Error fetching slots. Please try again.");
      }
    };
    
    fetchSlots();
  }, [formData.date, step]);

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

      const response = await fetch("https://salon-backend-qnkh.onrender.com/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) throw new Error("Booking failed");
      
      // Reset form
      setStep(1);
      setSelectedServices([]);
      setFormData({ name: "", phone: "", email: "", date: null, time: "" });
      alert("Booking successful!");
    } catch (error) {
      alert(`Booking failed: ${error.message}`);
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
    </div>
  );
};

export default AppointmentForm;