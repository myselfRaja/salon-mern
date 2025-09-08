const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// ✅ Load from .env
const envUsername = process.env.DB_USERNAME;
const envPassword = process.env.DB_PASSWORD;

// 🛡️ JWT Secret from .env
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username !== envUsername || password !== envPassword) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // 🔐 Generate JWT token
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

module.exports = router;