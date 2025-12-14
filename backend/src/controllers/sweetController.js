const jwt = require('jsonwebtoken');
const Sweet = require('../models/Sweet');

const createSweet = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      console.log(token);
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { name, category, price, quantity } = req.body;
    const sweet = await Sweet.create({ name, category, price, quantity });
    return res.status(201).json(sweet);
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Server error', message: error.message });
  }
};

module.exports = { createSweet };
