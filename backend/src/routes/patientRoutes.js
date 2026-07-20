import express from 'express';
import { 
  getPatientAppointments, 
  getPatientPrescriptions, 
  bookNewAppointment,
  getAvailableDoctors // 1. Yahan destructuring import mein add kiya
} from '../controllers/patientController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route Protection Layer
router.use(protect);
router.use(restrictTo('patient'));

// Live Endpoints Mapping
router.get('/appointments', getPatientAppointments);
router.get('/prescriptions', getPatientPrescriptions);
router.post('/appointments', bookNewAppointment); 

// 2. Active Dropdown data load karne ke liye naya route map kiya
router.get('/available-doctors', getAvailableDoctors); 

export default router;