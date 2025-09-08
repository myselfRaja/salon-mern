const express = require('express');
const router = express.Router();
const salonConfigController = require('../controllers/salonConfigController');
const auth = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

// Get salon configuration
router.get('/', auth, salonConfigController.getConfig);

// Update salon configuration
router.put('/', auth, isAdmin, salonConfigController.updateConfig);

module.exports = router;