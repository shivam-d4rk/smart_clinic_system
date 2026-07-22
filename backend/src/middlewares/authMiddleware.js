import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. Authenticate Token Middleware
export const protect = async (req, res, next) => {
  let token;

  // 1. Header se Authorization token check karein (Bearer / bearer)
  if (
    req.headers.authorization &&
    req.headers.authorization.toLowerCase().startsWith('bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Cookies se token read karein (Fallback)
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Please log in to access this resource!' 
    });
  }

  try {
    // Secret Key fallback (Render env variable compatibility fix)
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
    
    if (!secret) {
      console.error("[AUTH ERROR]: No JWT secret found in environment variables!");
    }

    // Token ko verify karein
    const decoded = jwt.verify(token, secret);

    // Database se user nikaalein (excluding password)
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'This user no longer exists or token is invalid!' 
      });
    }

    next(); // Access granted
  } catch (error) {
    console.error("[JWT VERIFICATION ERROR]:", error.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token, authorization failed' 
    });
  }
};

// 2. Role-Based Authorization Middleware
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ 
        success: false, 
        message: 'User role not defined!' 
      });
    }

    // Case-insensitive role comparison (e.g. 'doctor' vs 'Doctor')
    const userRole = req.user.role.toLowerCase();
    const formattedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    if (!formattedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'ACCESS DENIED! You do not have permission to perform this action.' 
      });
    }

    next();
  };
};