const Invoice = require('../models/invoice');
const Appointment = require('../models/appointment');
const SalonConfig = require('../models/SalonConfig');
const { sendInvoiceEmail } = require('../utils/emailServices');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate invoice number
const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear();
  return `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;
};

// Generate invoice
// Generate invoice
exports.generateInvoice = async (req, res) => {
  try {
    const { appointmentId, paymentMethod, issuedBy } = req.body;

    // Get appointment details
    const appointment = await Appointment.findById(appointmentId).populate('services');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.isBilled) {
      return res.status(400).json({ message: 'Invoice already generated for this appointment' });
    }

    // Get salon config
    const salonConfig = await SalonConfig.getConfig();
    if (!salonConfig) {
      return res.status(500).json({ message: 'Salon configuration not found' });
    }

    // ✅ Services handling
    let services = req.body.services && Array.isArray(req.body.services) ? req.body.services : [];
    if (!services.length && appointment.services) {
      services = appointment.services.map(s => ({
        name: s.name || s.serviceName || "Service",
        price: Number(s.price) || 0,
        quantity: Number(s.quantity) || 1
      }));
    }

    // ✅ Totals
    let subTotal = req.body.subTotal
      ? Number(req.body.subTotal)
      : services.reduce((t, s) => t + (Number(s.price) * Number(s.quantity || 1)), 0);

    const taxRate = Number(salonConfig.taxRate) || 0;
    const taxAmount = (subTotal * taxRate) / 100;
    const totalAmount = subTotal + taxAmount;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // ✅ Client details
    const clientDetails = {
      name: req.body.clientDetails?.name || appointment.customerName || "Customer",
      email: req.body.clientDetails?.email || appointment.customerEmail || "",
      phone: req.body.clientDetails?.phone || appointment.customerPhone || "0000000000"
    };

    // Create invoice
    const invoice = new Invoice({
      invoiceNumber,
      appointmentId,
      clientDetails,
      services,
      subTotal,
      taxRate,
      taxAmount,
      totalAmount,
      paymentMethod,
      issuedBy
    });

    await invoice.save();

    // Update appointment
    appointment.isBilled = true;
    appointment.invoice = invoice._id;
    await appointment.save();

    // ✅ AUTO EMAIL STEP (NEW)
    if (invoice.clientDetails?.email) {
      try {
        const pdfPath = await generatePDF(invoice);
        await sendInvoiceEmail(invoice, pdfPath);

        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }
        console.log("📩 Invoice emailed successfully!");
      } catch (err) {
        console.error("❌ Invoice email failed:", err);
        // ⚠️ Important: Do NOT fail invoice creation if email fails
      }
    }

    // ✅ Response
    res.status(201).json({
      message: 'Invoice generated successfully & email sent (if email available)',
      invoice
    });

  } catch (error) {
    console.log('🔥 FULL ERROR in generateInvoice:', error);
    res.status(500).json({ message: error.message });
  }
};



// Get invoice by ID
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all invoices
exports.getInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    let filter = {};
    
    if (startDate && endDate) {
      filter.issueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const invoices = await Invoice.find(filter)
      .sort({ issueDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Invoice.countDocuments(filter);
    
    res.json({
      invoices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send invoice via email
// ----- REPLACE your existing exports.sendInvoiceEmail with this -----
exports.sendInvoiceEmail = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (!invoice.clientDetails?.email) {
      return res.status(400).json({ message: 'Client email is missing on this invoice' });
    }

    // Generate fresh PDF
    const pdfPath = await generatePDF(invoice);

    // Send email with attachment
    await sendInvoiceEmail(invoice, pdfPath);

    // Clean temp
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }

    res.json({ success: true, message: 'Invoice sent via email successfully' });
  } catch (error) {
    console.error("❌ Error sending invoice email:", error);
    res.status(500).json({ message: error.message });
  }
};


// Generate sales reports
// Generate sales reports
exports.getSalesReport = async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'daily':
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        
        dateFilter = { $gte: todayStart, $lte: todayEnd };
        break;
      case 'weekly':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);

        dateFilter = { $gte: startOfWeek, $lte: endOfWeek };
        break;
      case 'monthly':
        dateFilter = {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        };
        break;
      case 'custom':
        if (!startDate || !endDate) {
          return res.status(400).json({ message: 'Start date and end date are required for custom period' });
        }
        dateFilter = { 
          $gte: new Date(startDate), 
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        };
        break;
    }

    const filter = { issueDate: dateFilter };
    const invoices = await Invoice.find(filter).populate('clientDetails', 'name');

    // Calculate basic metrics
    const totalSales = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalInvoices = invoices.length;
    const totalTax = invoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
    const averageBill = totalInvoices ? (totalSales / totalInvoices) : 0;

    // Sales by date for charting
    const salesByDateMap = {};
    invoices.forEach(inv => {
      const dateStr = inv.issueDate.toISOString().split('T')[0];
      if (!salesByDateMap[dateStr]) {
        salesByDateMap[dateStr] = { total: 0, count: 0 };
      }
      salesByDateMap[dateStr].total += inv.totalAmount || 0;
      salesByDateMap[dateStr].count += 1;
    });

    // Convert to array and calculate averages
    const salesByDate = Object.entries(salesByDateMap).map(([date, data]) => ({
      date,
      total: data.total,
      count: data.count,
      average: data.count > 0 ? data.total / data.count : 0
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Service-wise aggregation
    const serviceStats = {};
    invoices.forEach(inv => {
      inv.services.forEach(s => {
        if (!serviceStats[s.name]) {
          serviceStats[s.name] = { count: 0, revenue: 0 };
        }
        serviceStats[s.name].count += s.quantity || 1;
        serviceStats[s.name].revenue += (s.price || 0) * (s.quantity || 1);
      });
    });

    const topServices = Object.entries(serviceStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Payment method breakdown
    const paymentMethods = {};
    invoices.forEach(inv => {
      const method = inv.paymentMethod || 'Unknown';
      paymentMethods[method] = (paymentMethods[method] || 0) + (inv.totalAmount || 0);
    });

    // Top clients
    const clientStats = {};
    invoices.forEach(inv => {
      const clientId = inv.clientDetails?._id || 'unknown';
      const clientName = inv.clientDetails?.name || "Walk-in Customer";
      
      if (!clientStats[clientId]) {
        clientStats[clientId] = { client: clientName, revenue: 0 };
      }
      clientStats[clientId].revenue += inv.totalAmount || 0;
    });

    const topClients = Object.values(clientStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json({
      period,
      totalSales,
      totalInvoices,
      totalTax,
      averageBill,
      topServices,
      paymentMethods,
      topClients,
      salesByDate
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ message: error.message });
  }
};

// New export function
// Add this export function to your backend controller
exports.exportReport = async (req, res) => {
  try {
    const { period, startDate, endDate, format = 'pdf' } = req.query;
    
    // Reuse the existing report logic
    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'daily':
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        
        dateFilter = { $gte: todayStart, $lte: todayEnd };
        break;
      case 'weekly':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);

        dateFilter = { $gte: startOfWeek, $lte: endOfWeek };
        break;
      case 'monthly':
        dateFilter = {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        };
        break;
      case 'custom':
        if (!startDate || !endDate) {
          return res.status(400).json({ message: 'Start date and end date are required for custom period' });
        }
        dateFilter = { 
          $gte: new Date(startDate), 
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        };
        break;
    }

    const filter = { issueDate: dateFilter };
    const invoices = await Invoice.find(filter).populate('clientDetails', 'name');

    // Calculate metrics (same as getSalesReport)
    const totalSales = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalInvoices = invoices.length;
    const totalTax = invoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
    const averageBill = totalInvoices ? (totalSales / totalInvoices) : 0;

    // Prepare data for export based on format
    let exportData;
    let contentType;
    let fileName = `salon-report-${period}-${new Date().toISOString().slice(0, 10)}`;
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = invoices.map(invoice => ({
        Date: invoice.issueDate.toISOString().split('T')[0],
        'Invoice ID': invoice.invoiceNumber,
        'Client': invoice.clientDetails?.name || 'Walk-in',
        'Services': invoice.services.map(s => s.name).join(', '),
        'Amount': invoice.totalAmount,
        'Tax': invoice.taxAmount,
        'Payment Method': invoice.paymentMethod
      }));
      
      exportData = convertToCSV(csvData);
      contentType = 'text/csv';
      fileName += '.csv';
    } else if (format === 'excel') {
      // For Excel, you would typically use a library like exceljs
      // This is a simplified version
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileName += '.xlsx';
      exportData = 'Excel file content would be generated here'; // Placeholder
    } else {
      // Default to PDF
      contentType = 'application/pdf';
      fileName += '.pdf';
      exportData = 'PDF content would be generated here'; // Placeholder
    }

    // Set headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    // Send the file data
    res.send(exportData);
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to convert JSON to CSV
function convertToCSV(objArray) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = '';

  // Add header row
  let line = '';
  for (const key in array[0]) {
    if (line !== '') line += ',';
    line += key;
  }
  str += line + '\r\n';

  // Add data rows
  for (let i = 0; i < array.length; i++) {
    line = '';
    for (const key in array[i]) {
      if (line !== '') line += ',';
      
      let value = array[i][key] || '';
      // Handle values that contain commas
      if (typeof value === 'string' && value.includes(',')) {
        value = `"${value}"`;
      }
      
      line += value;
    }
    str += line + '\r\n';
  }

  return str;
}

// Generate PDF function
// ----- REPLACE your existing generatePDF with this -----
const generatePDF = async (invoice) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const salonConfig = await SalonConfig.getConfig();
      const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
      const tempDir = path.join(__dirname, '../temp');
      const filePath = path.join(tempDir, fileName);

      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Logo (local file path hi chalega)
      if (salonConfig.logoUrl && fs.existsSync(salonConfig.logoUrl)) {
        doc.image(salonConfig.logoUrl, 50, 45, { width: 100 });
      }

      // Dates fallback
      const issuedDate = invoice.issueDate || invoice.createdAt || new Date();

      // Salon info
      doc.fontSize(20).text(salonConfig.salonName || 'Salon', 50, 50);
      doc.fontSize(10).text(salonConfig.address || '', 50, 75);
      doc.text(`Contact: ${salonConfig.contactNumber || ''}`, 50, 90);
      doc.text(`GST: ${salonConfig.gstNumber || ''}`, 50, 105);

      // Invoice header
      doc.fontSize(16).text('INVOICE', 400, 50, { align: 'right' });
      doc.fontSize(10);
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 400, 70, { align: 'right' });
      doc.text(`Date: ${new Date(issuedDate).toLocaleDateString()}`, 400, 85, { align: 'right' });

      // Client
      doc.fontSize(12).text('Bill To:', 50, 150);
      doc.fontSize(10);
      doc.text(`Name: ${invoice.clientDetails?.name || ''}`, 50, 165);
      doc.text(`Email: ${invoice.clientDetails?.email || ''}`, 50, 180);
      doc.text(`Phone: ${invoice.clientDetails?.phone || ''}`, 50, 195);

      // Services
      let y = 250;
      doc.fontSize(12).text('Services', 50, y);
      y += 20;
      doc.text('Description', 50, y);
      doc.text('Quantity', 250, y);
      doc.text('Price', 350, y);
      doc.text('Amount', 450, y);
      y += 15;

      invoice.services.forEach((service) => {
        const qty = Number(service.quantity || 1);
        const price = Number(service.price || 0);
        const amount = qty * price;

        // const name = String(service.name || '').replace(/\(\s*\d+\s*mins?\)/i, '').trim();
        const name = String(service.name || '').trim();

        doc.text(name, 50, y);
        doc.text(qty.toString(), 250, y);
        doc.text(`₹${price.toFixed(2)}`, 350, y);
        doc.text(`₹${amount.toFixed(2)}`, 450, y);
        y += 20;
      });

      // Totals
      y += 20;
      const subTotal = Number(invoice.subTotal || 0);
      const taxRate = Number(invoice.taxRate || 0);
      const taxAmount = Number(invoice.taxAmount || 0);
      const totalAmount = Number(invoice.totalAmount || 0);

      doc.text(`Subtotal: ₹${subTotal.toFixed(2)}`, 350, y);
      y += 20;
      doc.text(`Tax (${taxRate}%): ₹${taxAmount.toFixed(2)}`, 350, y);
      y += 20;
      doc.fontSize(14).text(`Total: ₹${totalAmount.toFixed(2)}`, 350, y);
      y += 30;

      doc.fontSize(10).text(`Payment Method: ${invoice.paymentMethod || ''}`, 50, y);
      y += 20;
      doc.text(`Issued By: ${invoice.issuedBy || ''}`, 50, y);

      // Footer
      doc.fontSize(8).text('Thank you for your business!', 50, 700, { align: 'center' });

      doc.end();

      // ✅ MOST IMPORTANT: wait for file write to finish
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};


// PDF preview route
exports.generatePDFPreview = async (req, res) => {
  try {
    const { invoiceData } = req.body;
    
    const doc = new PDFDocument({ size: [80, 297], margin: 5 }); // Thermal paper size
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice-preview.pdf');
    
    // Thermal printer friendly formatting
    doc.fontSize(10);
    doc.text('BEAUTY SALON', { align: 'center' });
    doc.text('123 Beauty Street, City', { align: 'center' });
    doc.moveDown();
    
    doc.text(`Invoice: ${invoiceData.invoiceNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`);
    doc.moveDown();
    
    doc.text(`Customer: ${invoiceData.customer.name}`);
    doc.text(`Phone: ${invoiceData.customer.phone}`);
    doc.moveDown();
    
    // Services
    invoiceData.services.forEach(service => {
      doc.text(`${service.name}`.padEnd(30, '.') + `₹${service.price}`);
    });
    
    doc.moveDown();
    doc.text('Subtotal:'.padEnd(30, '.') + `₹${invoiceData.subtotal}`);
    doc.text('GST (18%):'.padEnd(30, '.') + `₹${invoiceData.tax}`);
    doc.text('TOTAL:'.padEnd(30, '.') + `₹${invoiceData.total}`, { fontWeight: 'bold' });
    doc.moveDown();
    
    doc.text(`Payment Mode: ${invoiceData.paymentMethod}`);
    doc.text(`Staff: ${invoiceData.issuedBy}`);
    doc.moveDown();
    
    doc.text('Thank You! Visit Again!', { align: 'center' });
    
    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};