import express from 'express';
import { getDoctorAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { createPrescription } from '../controllers/prescriptionController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Auth & Role Protection
router.use(protect);
router.use(restrictTo('doctor'));

router.get('/appointments', getDoctorAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);

// 🛠️ FIX HERE: '/prescription' ko '/prescriptions' kar do 
// (ya fir frontend me '/doctor/prescription' bhejo)
router.post('/prescriptions', createPrescription); 

export default router;