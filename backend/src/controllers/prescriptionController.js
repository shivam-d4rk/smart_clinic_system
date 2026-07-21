import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';

// @desc    Create a new Prescription for a Patient
// @route   POST /api/doctor/prescriptions
export const createPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, medicines, advice } = req.body;

    if (!appointmentId || !medicines) {
      return res.status(400).json({ 
        success: false, 
        message: 'Appointment ID and Medicines are required' 
      });
    }

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Valid appointment record not found' 
      });
    }

    if (appointment.doctorId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Aap is patient ke assigned doctor nahi hain' 
      });
    }

    const prescription = await Prescription.create({
      appointmentId,
      diagnosis: diagnosis || 'General Clinical Consultation', // Fix for NotNull constraint
      medicines,
      advice: advice || 'Take rest and drink sufficient water.',
      doctorId: req.user.id,
      patientId: appointment.patientId
    });

    appointment.status = 'completed';
    await appointment.save();

    return res.status(201).json({
      success: true,
      message: 'Prescription generated successfully',
      data: prescription
    });
  } catch (error) {
    console.error("[PRESCRIPTION ERROR]:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};