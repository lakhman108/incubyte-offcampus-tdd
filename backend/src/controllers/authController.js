const User = require('../models/User');
const validateRegistration = require('../utils/validators');
const { signToken } = require('../utils/tokengenerator');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const validationError = validateRegistration(username, email, password);
    if (validationError !== null) {
      return res.status(400).send({
        error: validationError
      });
    }

    // Check if user is already exists
    const existingUser = await User.findOne({ email });

    if (existingUser !== null) {
      return res.status(409).send({
        error: 'already exists'
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
    return res.status(500).json({
      error: 'Server error during registration'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = signToken(user);

    // Return user without password
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error during login'
    });
  }
};

module.exports = { register, login };
