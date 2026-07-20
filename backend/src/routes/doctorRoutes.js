import express from 'express';
import { getDoctorAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { createPrescription } from '../controllers/prescriptionController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Dono routes par protect layer laga di taaki login compulsory ho, 
// aur restrictTo('doctor') lagaya taaki sirf doctors access kar sakein!
router.use(protect);
router.use(restrictTo('doctor'));

router.get('/appointments', getDoctorAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.post('/prescription', createPrescription);

export default router;