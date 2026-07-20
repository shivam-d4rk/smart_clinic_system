import User from '../models/User.js';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/signup
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Yeh email pehle se registered hai' });
    }

    // 2. Hash password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert record into PostgreSQL database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role ? role.toLowerCase() : 'patient', // Force standard lowercase validation consistency
      phone
    });

    if (user) {
      // 4. Set HttpOnly JWT session token inside browser cookies
      generateToken(res, user.id);

      return res.status(201).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
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

    // 1. Extract matching profile details from User table
    const user = await User.findOne({ where: { email } });
    
    // 2. Check credentials validity matrix
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Galat email ya password' });
    }

    // 3. Generate dynamic token state mapping session cookie
    generateToken(res, user.id);

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone // Added to sync dashboard dashboard cards seamlessly
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 🌟 ADDED: User persistent session trace hook
// @desc    Get current logged in user profile details
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    // req.user protection pipeline middleware se automatic attach hokar aata hai
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

// 🌟 ADDED: Secure clean session logout engine
// @desc    Logout user / clear secure cookie storage
// @route   POST /api/auth/logout
export const logoutUser = async (req, res) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0), // Wipe token out completely instantly
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};