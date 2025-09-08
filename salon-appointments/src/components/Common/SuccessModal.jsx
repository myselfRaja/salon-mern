import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./SuccessModel.css";

const SuccessModal = ({ data, onClose }) => {
  if (!data) return null;

  const downloadInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Salon Appointment Invoice", 14, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${data.name}`, 14, 40);
    doc.text(`Phone: ${data.phone}`, 14, 50);
    doc.text(`Email: ${data.email}`, 14, 60);
    doc.text(`Date: ${data.date}`, 14, 70);
    doc.text(`Time: ${data.time}`, 14, 80);

    const services = data.services.map(s => [s]);
    doc.autoTable({
      startY: 100,
      head: [["Services"]],
      body: services
    });

    doc.text(`Total Price: ₹${data.totalPrice}`, 14, doc.lastAutoTable.finalY + 20);
    doc.save("invoice.pdf");
  };

  return (
    <div className="success-modal">
      <div className="success-content">
        <h2>🎉 Booking Successful!</h2>
        <p>Your appointment has been booked successfully.</p>
        <button onClick={downloadInvoice}>Download Invoice</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SuccessModal;
