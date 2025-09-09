import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateInvoice, sendInvoiceEmail} from '../services/api';
import './InvoiceModel.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { printInvoice } from '../utils/printService'; // ✅ Aapka banaya hua import

 const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";


const InvoiceModal = ({ appointment, onClose, onInvoiceGenerated }) => {
  useEffect(() => {
     
  if (appointment?.invoice?._id) {
    setGeneratedInvoiceId(appointment.invoice._id);
  }
}, [appointment]);



  const [generatedInvoiceId, setGeneratedInvoiceId] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [issuedBy, setIssuedBy] = useState('');

    useEffect(() => {
  
  }, [generatedInvoiceId]);

  // ✅ SIMPLIFIED SERVICE PARSING FUNCTION
  // ✅ Fix service parsing
const getServices = () => {
  if (!appointment?.services) return [];

  try {
    if (typeof appointment.services === "string") {
      // case: "Facial - ₹400"
      return appointment.services.split(",").map(service => {
        const cleanService = service.trim();
        const priceMatch = cleanService.match(/(\d+(\.\d+)?)(?=[^\d]*$)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

        return {
          name: cleanService
            .replace(/₹?\d+(\.\d+)?/g, "")
            .replace(/\(\s*\d+\s*mins?\)/i, "")
            .replace(/[-–]/g, "")
            .trim(),
          price: price,
          quantity: 1
        };
      });
    }

    if (Array.isArray(appointment.services)) {
      return appointment.services.map(service => {
        if (typeof service === "string") {
          // ✅ handle ["Facial (45 mins) - ₹400"]
          const cleanService = service.trim();
          const priceMatch = cleanService.match(/(\d+(\.\d+)?)(?=[^\d]*$)/);
          const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

          return {
            name: cleanService
              .replace(/₹?\d+(\.\d+)?/g, "")
              .replace(/\(\s*\d+\s*mins?\)/i, "")
              .replace(/[-–]/g, "")
              .trim(),
            price: price,
            quantity: 1
          };
        }

        // fallback agar object ho
        let price = 0;
        if (typeof service.price === "string") {
          const match = service.price.match(/(\d+(\.\d+)?)/);
          price = match ? parseFloat(match[1]) : 0;
        } else {
          price = Number(service.price) || 0;
        }

        return {
          name: service.name || "Service",
          price,
          quantity: Number(service.quantity) || 1
        };
      });
    }
  } catch (error) {
    console.error("❌ Error parsing services:", error);
  }

  return [];
};



  const services = getServices();
  const subtotal = services.reduce((total, service) => total + (service.price * service.quantity), 0);
  const taxRate = 0.18;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  // Debug logs to verify calculation


    // Debug logs to verify calculation
  useEffect(() => {
    
  }, [appointment, services, subtotal, taxAmount, totalAmount]);

  // ✅ PRINT FUNCTION
  const handlePrint = () => {
    const invoiceData = {
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.random().toString().substr(2,4)}`,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      customer: {
        name: appointment.name,
        phone: appointment.phone,
        email: appointment.email
      },
      services: services,
      subtotal: subtotal,
      tax: taxAmount,
      total: totalAmount,
      paymentMethod: paymentMethod,
      staff: issuedBy
    };
    
    printInvoice(invoiceData);
  };

  // ✅ DOWNLOAD PDF FUNCTION
  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
     const response = await fetch(`${backendURL}/api/invoices/pdf-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          invoiceData: {
            invoiceNumber: `INV-${new Date().getFullYear()}-${Math.random().toString().substr(2,4)}`,
            customer: {
              name: appointment.name,
              phone: appointment.phone,
              email: appointment.email
            },
            services: services,
            subtotal: subtotal,
            tax: taxAmount,
            total: totalAmount,
            paymentMethod: paymentMethod,
            issuedBy: issuedBy
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('PDF generation failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ INVOICE GENERATION FUNCTION
 const handleGenerateInvoice = async () => {

    if (!issuedBy.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!appointment?._id) {
      toast.error("❌ Invalid appointment selected. Please refresh the list.");
      return;
    }

    setLoading(true);
    try {
      const response = await generateInvoice({
        appointmentId: appointment._id,
        paymentMethod,
        issuedBy: issuedBy.trim(),
        services: services,
        clientDetails: {
          name: appointment.name || "Customer",
          phone: appointment.phone || "Not provided",
          email: appointment.email || "Not provided",
        },
        subTotal: subtotal,
        taxRate: taxRate * 100,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
      });

      if (response.data && response.data.success) {
        if (response.data.invoiceAlreadyExists) {
          toast.info("⚠️ Invoice already generated for this appointment.");
          setGeneratedInvoiceId(response.data.invoice._id);
        } else {
          toast.success("✅ Invoice generated successfully!", { autoClose: 2000 });
          setGeneratedInvoiceId(response.data.invoice._id);

          // ✅ Auto send email
          try {
            const emailRes = await sendInvoiceEmail(response.data.invoice._id);
            if (emailRes.data?.success) {
              toast.success("📧 Invoice emailed to customer!");
            } else {
              toast.error(emailRes.data?.message || "Invoice generated but email failed");
            }
          } catch (err) {
            console.error("❌ Email auto-send failed:", err);
            toast.error("Invoice generated but email failed");
          }
        }

        // ✅ 2s ke baad modal close hoga
        setTimeout(() => {
          onInvoiceGenerated();
        }, 2000);
      } else {
        throw new Error(response.data?.message || "Invoice generation failed");
      }
    } catch (error) {
      console.error("Invoice generation error:", error);
      toast.error("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };




  // Send Invoice Email
  // ----------------------------

  return (
    <motion.div 
      className="invoice-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="invoice-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="invoice-modal-header">
          <h3>Generate Invoice</h3>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className="invoice-modal-body" id="invoice-content">
          {/* Customer Details */}
          <div className="invoice-section">
            <h5>Customer Details</h5>
            <div className="invoice-details">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{appointment.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{appointment.phone || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{appointment.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="invoice-section">
            <h5>Services</h5>
            <div className="services-list">
              {services.map((service, index) => (
                <div key={index} className="service-item">
                  <span className="service-name">{service.name}</span>
                  <span className="service-price">₹{service.price} x {service.quantity}</span>
                </div>
              ))}
            </div>
            <div className="invoice-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax (18%):</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="invoice-section">
            <h5>Payment Details</h5>
            <div className="form-group">
              <label>Payment Method:</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={loading}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
              </select>
            </div>

            <div className="form-group">
              <label>Issued By:</label>
              <input
                type="text"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                placeholder="Enter your name"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* ✅ SINGLE FOOTER SECTION */}
        <div className="invoice-modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-print" onClick={handlePrint} disabled={loading}>
            🖨️ Print
          </button>
 
          <button className="btn-generate" onClick={handleGenerateInvoice} disabled={loading}>
            {loading ? 'Generating...' : '💳 Generate Invoice'}
          </button>
          <ToastContainer position="top-center" autoClose={3000} />

        </div>
      </motion.div>
    </motion.div>
  );
};

export default InvoiceModal;