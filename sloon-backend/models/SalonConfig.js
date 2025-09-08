const mongoose = require('mongoose');

const SalonConfigSchema = new mongoose.Schema({
  salonName: {
    type: String,
    default: 'Beauty Salon'
  },
  logoUrl: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  contactNumber: {
    type: String,
    default: ''
  },
  gstNumber: {
    type: String,
    default: ''
  },
  taxRate: {
    type: Number,
    default: 18
  }
}, {
  timestamps: true
});

// Ensure only one document exists
SalonConfigSchema.statics.getConfig = function() {
  return this.findOne().then(config => {
    if (!config) {
      return this.create({});
    }
    return config;
  });
};

module.exports = mongoose.model('SalonConfig', SalonConfigSchema);