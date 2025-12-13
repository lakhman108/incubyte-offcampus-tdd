const User = require('../models/User');
const validateRegistration = require('../utils/validators');
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const validationError = validateRegistration(username, email, password);
    if (validationError !== null) {
      return res.status(400).send({
        error: validationError
      });
    }

    const user = new User({ username, email, password });
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
