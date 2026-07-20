import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. Authenticate Token Middleware (Check karein ki user logged in hai ya nahi)
export const protect = async (req, res, next) => {
  let token;

  // Thunder Client/Browser ke cookies se token read karein
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } 
  // Alternately, agar token Authorization Header me aa raha ho (Bearer token)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Aap logged in nahi hain, please login karein' });
  }

  try {
    // Token ko verify karein hamari secret key se
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Database se user ka current record nikaalein bina password ke aur use 'req.user' me save kar dein
    req.user = await User.findByPk(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Is token wala user ab exist nahi karta' });
    }

    next(); // Agle controller function par jane ki permission dein
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid Token, authorization failed' });
  }
};

// 2. Role-Based Authorization Middleware (Strict Permission Engine)
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    // allowedRoles ek array hoga, jaise ['doctor', 'admin']
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Aapko is action ko karne ki permission nahi hai (Access Denied)' 
      });
    }
    next();
  };
};