const jwt = require('jsonwebtoken');

// Single Responsibility: Extract token from header
const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

// Single Responsibility: Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Single Responsibility: Check if user has required role
const hasRole = (user, requiredRole) => user.role === requiredRole;

// Open/Closed Principle: Base authentication function
const authenticate =
  (requiredRole = null) =>
  (req, res, next) => {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (requiredRole && !hasRole(decoded, requiredRole)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = decoded;
    return next();
  };

// Interface Segregation: Specific middleware for different roles
const authenticateCustomer = authenticate();
const authenticateAdmin = authenticate('admin');

module.exports = { authenticateCustomer, authenticateAdmin };
