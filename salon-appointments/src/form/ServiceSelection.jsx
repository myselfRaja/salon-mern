import React from 'react';
import './ServiceSelection.css';
import { motion } from 'framer-motion';

const ServiceSelection = ({ selectedServices, onServiceSelect, onProceed, error }) => {
  const services = [
    { id: 1, name: "💇‍♀️ Haircut", duration: 30, price: 200 },
    { id: 2, name: "🌸 Facial", duration: 45, price: 400 },
    { id: 3, name: "💆‍♂️ Massage", duration: 60, price: 500 }
  ];

  return (
    <motion.div 
      className="service-selection page-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Select Services
      </motion.h2>

      <div className="services-list">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            className={`service-item ${selectedServices.some(s => s.id === service.id) ? 'selected' : ''}`}
            whileHover={{ scale: 1.03 }}
            transition={{ delay: index * 0.1 }}
          >
            <label>
              <input
                type="checkbox"
                checked={selectedServices.some(s => s.id === service.id)}
                onChange={() => onServiceSelect(service)}
              />
              <span>{service.name} ({service.duration} mins) - ₹{service.price}</span>
            </label>
          </motion.div>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      <motion.div 
        className="selected-summary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3>Selected: {selectedServices.length} services</h3>
        <h3>Total: ₹{selectedServices.reduce((sum, s) => sum + s.price, 0)}</h3>
      </motion.div>

      <motion.button 
        onClick={onProceed} 
        disabled={selectedServices.length === 0}
        whileTap={{ scale: 0.95 }}
        className="proceed-btn"
      >
        Proceed to Booking
      </motion.button>
    </motion.div>
  );
};

export default ServiceSelection;
