const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = new User({ username, email, password });

    //validate required field
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username,email and password are required'
      });
    }

    //email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    await user.save();
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    return res.status(201).json({
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error during registration'
    });
  }
};

module.exports = { register };
