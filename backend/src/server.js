const express = require('express');
const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'server is running',
  });
});


module.exports = app;
