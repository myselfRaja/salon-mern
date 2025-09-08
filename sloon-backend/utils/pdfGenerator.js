const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const SalonConfig = require('../models/SalonConfig');

exports.generateInvoicePDF = async (invoice) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const salonConfig = await SalonConfig.getConfig();
      const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
      const filePath = path.join(__dirname, '../temp', fileName);
      
      // Ensure temp directory exists
      if (!fs.existsSync(path.join(__dirname, '../temp'))) {
        fs.mkdirSync(path.join(__dirname, '../temp'));
      }
      
      doc.pipe(fs.createWriteStream(filePath));
      
      // Add logo if exists
      if (salonConfig.logoUrl && fs.existsSync(salonConfig.logoUrl)) {
        doc.image(salonConfig.logoUrl, 50, 45, { width: 100 });
      }
      
      // Salon information
      doc.fontSize(20).text(salonConfig.salonName, 50, 50);
      doc.fontSize(10).text(salonConfig.address, 50, 75);
      doc.text(`Contact: ${salonConfig.contactNumber}`, 50, 90);
      doc.text(`GST: ${salonConfig.gstNumber}`, 50, 105);
      
      // Invoice title and details
      doc.fontSize(16).text('INVOICE', 400, 50, { align: 'right' });
      doc.fontSize(10);
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 400, 70, { align: 'right' });
      doc.text(`Date: ${invoice.issueDate.toLocaleDateString()}`, 400, 85, { align: 'right' });
      
      // Client information
      doc.fontSize(12).text('Bill To:', 50, 150);
      doc.fontSize(10);
      doc.text(`Name: ${invoice.clientDetails.name}`, 50, 165);
      doc.text(`Email: ${invoice.clientDetails.email || 'N/A'}`, 50, 180);
      doc.text(`Phone: ${invoice.clientDetails.phone}`, 50, 195);
      
      // Services table
      let y = 250;
      doc.fontSize(12).text('Services', 50, y);
      y += 20;
      
      // Table headers
      doc.text('Description', 50, y);
      doc.text('Quantity', 250, y);
      doc.text('Price', 350, y);
      doc.text('Amount', 450, y);
      y += 15;
      
      // Table rows
      invoice.services.forEach(service => {
        const amount = service.price * (service.quantity || 1);
        doc.text(service.name, 50, y);
        doc.text((service.quantity || 1).toString(), 250, y);
        doc.text(`₹${service.price.toFixed(2)}`, 350, y);
        doc.text(`₹${amount.toFixed(2)}`, 450, y);
        y += 20;
      });
      
      // Summary
      y += 20;
      doc.text(`Subtotal: ₹${invoice.subTotal.toFixed(2)}`, 350, y);
      y += 20;
      doc.text(`Tax (${invoice.taxRate}%): ₹${invoice.taxAmount.toFixed(2)}`, 350, y);
      y += 20;
      doc.fontSize(14).text(`Total: ₹${invoice.totalAmount.toFixed(2)}`, 350, y);
      y += 30;
      
      doc.text(`Payment Method: ${invoice.paymentMethod}`, 50, y);
      y += 20;
      doc.text(`Issued By: ${invoice.issuedBy}`, 50, y);
      
      // Footer
      doc.fontSize(8).text('Thank you for your business!', 50, 700, { align: 'center' });
      
      doc.end();
      
      doc.on('end', () => {
        resolve(filePath);
      });
    } catch (error) {
      reject(error);
    }
  });
};