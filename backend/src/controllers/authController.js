import User from '../models/User.js';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

// Helper function: Pure token string return karne ke liye
const signToken = (id) => {
  const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || 'defaultsecret';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, adminSecretKey } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'This email is already registered!' });
    }

    const requestedRole = role ? role.toLowerCase() : 'patient';

    // 🔒 SECURITY CHECK: If role is Admin, verify Secret Key
    if (requestedRole === 'admin' || requestedRole === 'system admin') {
      const MASTER_KEY = process.env.ADMIN_SECRET_KEY || 'ClinicAdmin2026';
      
      if (!adminSecretKey || adminSecretKey !== MASTER_KEY) {
        return res.status(403).json({ 
          success: false, 
          message: 'Invalid Admin Secret Key! Access Denied.' 
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert record into PostgreSQL database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: requestedRole,
      phone
    });

    if (user) {
      // 1. Set Cookie (Fallback)
      if (typeof generateToken === 'function') {
        generateToken(res, user.id);
      }

      // 2. Plain JWT Token String
      const token = signToken(user.id);

      const userPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      };

      return res.status(201).json({
        success: true,
        token: token,            // 🌟 FRONTEND LOCALSTORAGE KE LIYE TOKEN
        user: userPayload,       // 🌟 EASY ACCESS USER OBJECT
        data: userPayload
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Extract matching profile details
    const user = await User.findOne({ where: { email } });
    
    // 2. Check credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 3. Set cookie
    if (typeof generateToken === 'function') {
      generateToken(res, user.id);
    }

    // 4. Generate plain JWT Token String for Authorization Header
    const token = signToken(user.id);

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    };

    // 🌟 RETURN TOKEN AND USER EXPLICITLY IN JSON BODY
    return res.status(200).json({
      success: true,
      token: token,             // <-- YEAH! Ab local storage ko token directly milega!
      user: userPayload,        // <-- User profile values
      data: userPayload
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user profile details
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No active clinical session found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user / clear secure cookie storage
// @route   POST /api/auth/logout
export const logoutUser = async (req, res) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};