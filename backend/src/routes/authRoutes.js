import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  registerUser, 
  loginUser, 
  getMe,        // 🌟 Naya imported handler
  logoutUser    // 🌟 Logout endpoint support ke liye import kiya
} from '../controllers/authController.js';

const router = express.Router();

// 1. Dynamic User Session Persistence Engine
// (Inline handler ko hatakar clean controller link kar diya)
router.get('/me', protect, getMe);

// 2. Authentication Gateway Routes
router.post('/signup', registerUser);
router.post('/login', loginUser);

// 3. Secure Session Expiration Route
// (Iske miss hone se logout button response nahi de raha tha)
router.post('/logout', logoutUser);

export default router;