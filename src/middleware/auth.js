'use strict';

const jwt = require('jsonwebtoken');
const EmployeeRepository = require('../repositories/EmployeeRepository');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to verify JWT token and attach user info to the request.
 * Expected Authorization header format: "Bearer <token>"
 */
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      return res.status(401).json({ message: 'Missing Authorization header' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid Authorization format' });
    }

    const token = parts[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    if (!payload || !payload.id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const employee = await EmployeeRepository.findById(payload.id);
    if (!employee) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach minimal user info to request for downstream middleware/controllers
    req.user = {
      id: employee.id,
      role: employee.role,
      storeId: employee.storeId,
    };

    return next();
  } catch (err) {
    // Unexpected errors
    console.error('Authentication middleware error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Factory that returns a middleware enforcing role-based access.
 * @param {string[]} allowedRoles - Array of roles permitted to access the route.
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
      // If no roles are specified, allow any authenticated user
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}

module.exports = {
  verifyToken,
  requireRole,
};