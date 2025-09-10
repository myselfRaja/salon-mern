// BookingForm.jsx
import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./BookingForm.css";

const BookingForm = ({
  selectedServices,
  totalPrice,
  formData,
  availableSlots,
  loading,
  onFieldChange,
  onDateChange,
  onTimeChange,
  onBack,
  onSubmit
}) => {
  const [errors, setErrors] = useState({});

  // Email validation function
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  // Real-time email validation
  const handleEmailChange = (email) => {
    onFieldChange('email', email);
    
    if (!email) {
      setErrors({...errors, email: ""});
    } else if (!validateEmail(email)) {
      setErrors({...errors, email: "Please enter a complete email address"});
    } else {
      setErrors({...errors, email: ""});
    }
  };

  // Form validation before submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Please enter your full name (min 2 characters)";
    }
    
    // Phone validation
    if (!formData.phone || !/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter valid 10-digit phone number";
    }
    
    // Email validation
    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = "Please enter a complete valid email address";
    }
    
    // Date validation
    if (!formData.date) {
      newErrors.date = "Please select a date";
    }
    
    // Time validation
    if (!formData.time) {
      newErrors.time = "Please select a time slot";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors and submit
    setErrors({});
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <div className="form-header">
        <h2>Complete Your Booking</h2>
        <div className="progress-indicator">Step 2 of 2</div>
      </div>

      <div className="selected-services">
        <h3>Selected Services</h3>
        <div className="services-list">
          {selectedServices.map(service => (
            <div key={service.id} className="service-item">
              <span>{service.name}</span>
              <span>₹{service.price}</span>
            </div>
          ))}
        </div>
        <div className="total-price">
          Total: ₹{totalPrice}
        </div>
      </div>

      <div className="form-section">
        <h3>Personal Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              required
              className={errors.name ? 'input-error' : ''}
              placeholder="Enter your full name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              required
              pattern="[0-9]{10}"
              className={errors.phone ? 'input-error' : ''}
              placeholder="10-digit number"
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              className={errors.email ? 'input-error' : ''}
              placeholder="example@gmail.com"
            />
            {errors.email && (
              <span className="error-text">
                {errors.email}
                <br />
                <small>Example: name@domain.com</small>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Select Date & Time</h3>
        <div className="datetime-selection">
          <div className="form-group">
            <label>Choose Date *</label>
            <DatePicker
              selected={formData.date}
              onChange={onDateChange}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select date"
              className={`date-picker ${errors.date ? 'input-error' : ''}`}
              required
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>

          {formData.date && (
            <div className="form-group">
              <label>Available Time Slots *</label>
              <div className="time-slot-grid">
                {availableSlots.map(slot => (
                  <button
                    type="button"
                    key={slot}
                    className={`time-slot ${formData.time === slot ? 'selected' : ''} ${errors.time ? 'input-error' : ''}`}
                    onClick={() => onTimeChange(slot)}
                    disabled={availableSlots.length === 0}
                  >
                    {slot}
                  </button>
                ))}
                {availableSlots.length === 0 && (
                  <p className="no-slots">No available slots for this date</p>
                )}
              </div>
              {errors.time && <span className="error-text">{errors.time}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          onClick={onBack} 
          className="back-button"
        >
          ← Back to Services
        </button>
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading || !formData.time}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            "Confirm Booking"
          )}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;