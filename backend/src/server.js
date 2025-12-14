const express = require('express');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const sweetRoutes = require('./routes/sweetRoutes');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'server is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes);
// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
