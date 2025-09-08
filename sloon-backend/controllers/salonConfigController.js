const SalonConfig = require('../models/SalonConfig');

// Get salon configuration
exports.getConfig = async (req, res) => {
  try {
    const config = await SalonConfig.getConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update salon configuration
exports.updateConfig = async (req, res) => {
  try {
    const config = await SalonConfig.getConfig();
    
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        config[key] = req.body[key];
      }
    });
    
    await config.save();
    res.json({ message: 'Configuration updated successfully', config });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};