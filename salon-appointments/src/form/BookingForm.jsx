// BookingForm.jsx
import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./BookingForm.css"; // Create this CSS file

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
  return (
    <form onSubmit={onSubmit} className="booking-form">
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
            <label>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              required
              pattern="[0-9]{10}"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Select Date & Time</h3>
        <div className="datetime-selection">
          <div className="form-group">
            <label>Choose Date</label>
            <DatePicker
              selected={formData.date}
              onChange={onDateChange}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select date"
              className="date-picker"
              required
            />
          </div>

          {formData.date && (
            <div className="form-group">
              <label>Available Time Slots</label>
              <div className="time-slot-grid">
                {availableSlots.map(slot => (
                  <button
                    type="button"
                    key={slot}
                    className={`time-slot ${formData.time === slot ? 'selected' : ''}`}
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