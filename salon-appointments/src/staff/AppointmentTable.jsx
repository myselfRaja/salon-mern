import React, { useState } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AppointmentCard.css";
import InvoiceModal from "./InvoiceModal"; // ✅ InvoiceModal import karo

function AppointmentCardGrid({
  currentAppointments,
  setEditingAppointment,
  setFormData,
  handleDelete,
  appointmentsPerPage,
  currentPage,
}) {
  const [selectedAppointment, setSelectedAppointment] = useState(null); // ✅ Invoice ke liye
  const [showInvoiceModal, setShowInvoiceModal] = useState(false); // ✅ Modal control

  // Prepare edit data when edit button is clicked
  const prepareEditData = (appointment) => {
    setFormData({
      name: appointment.name,
      date: format(parseISO(appointment.date), "yyyy-MM-dd"),
      time: appointment.time,
      phone: appointment.phone,
      email: appointment.email || "",
      services: appointment.services || [],
      totalPrice: appointment.totalPrice || 0
    });
    setEditingAppointment(appointment);
  };

  // ✅ Generate Bill button handler
  const handleGenerateBill = (appointment) => {
    setSelectedAppointment(appointment);
    setShowInvoiceModal(true);
  };

  // ✅ Invoice generate hone ke baad
  const handleInvoiceGenerated = () => {
    setShowInvoiceModal(false);
    setSelectedAppointment(null);
    toast.success("Invoice generated successfully!");
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      },
    }),
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    }
  };

  // Format services display
  const formatServices = (services) => {
    if (Array.isArray(services)) {
      return services.join(", ");
    }
    return services || "Not specified";
  };

  return (
    <div className="container mt-4">
      {/* ✅ Invoice Modal */}
      {showInvoiceModal && selectedAppointment && (
        <InvoiceModal
          appointment={selectedAppointment}
          onClose={() => setShowInvoiceModal(false)}
          onInvoiceGenerated={handleInvoiceGenerated}
        />
      )}

      <div className="row g-4">
        {currentAppointments.length > 0 ? (
          currentAppointments.map((appointment, index) => (
            <motion.div
              className="col-sm-12 col-md-6 col-lg-4"
              key={appointment._id}
              custom={index}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={cardVariants}
              layout
            >
              <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">{appointment.name}</h5>
                  <small className="text-white-50">
                    Token #{appointmentsPerPage * (currentPage - 1) + index + 1}
                  </small>
                </div>
                
                <div className="card-body">
                  <div className="appointment-details">
                    <div className="detail-item">
                      <span className="detail-label">📅 Date:</span>
                      <span className="detail-value">
                        {format(parseISO(appointment.date), "PPP")}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">⏰ Time:</span>
                      <span className="detail-value">
                        {appointment.time}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">📱 Phone:</span>
                      <span className="detail-value">
                        {appointment.phone || "Not provided"}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">✉️ Email:</span>
                      <span className="detail-value">
                        {appointment.email || "Not provided"}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">💇 Services:</span>
                      <span className="detail-value">
                        {formatServices(appointment.services)}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">⏱️ Duration:</span>
                      <span className="detail-value">
                        {appointment.duration} mins
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">💰 Price:</span>
                      <span className="detail-value">
                        ₹{appointment.totalPrice || "0"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="card-footer bg-transparent border-top-0">
                  <div className="d-flex justify-content-between gap-2">
                    <motion.button
                      className="btn btn-outline-warning btn-sm flex-fill"
                      onClick={() => prepareEditData(appointment)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Edit
                    </motion.button>
                    
                    {/* ✅ Generate Bill Button */}
                    <motion.button
                      className="btn btn-outline-success btn-sm flex-fill"
                      onClick={() => handleGenerateBill(appointment)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Generate Bill
                    </motion.button>
                    
                    <motion.button
                      className="btn btn-outline-danger btn-sm flex-fill"
                      onClick={() => handleDelete(appointment._id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="col-12 text-center py-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="alert alert-info">
              <i className="bi bi-calendar-x me-2"></i>
              No appointments found for this period
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default AppointmentCardGrid;