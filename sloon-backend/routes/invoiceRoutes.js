const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

// Generate invoice
router.post('/generate',  invoiceController.generateInvoice);

// Get invoice by ID
router.get('/:id', auth, invoiceController.getInvoice);

// Get all invoices
router.get('/', auth, invoiceController.getInvoices);

// Send invoice via email
router.post('/:id/email', auth, invoiceController.sendInvoiceEmail);

// PDF Preview route
router.post('/pdf-preview',  invoiceController.generatePDFPreview);

// Get sales reports
router.get('/reports/sales', invoiceController.getSalesReport);

router.get('/reports/export', invoiceController.exportReport);

module.exports = router;