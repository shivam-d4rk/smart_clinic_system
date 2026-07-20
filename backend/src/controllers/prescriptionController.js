import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';

// @desc    Create a new Prescription for a Patient
// @route   POST /api/prescriptions
export const createPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, medicines, advice } = req.body;

    // Verify appointment existence criteria
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Valid appointment id required' });
    }

    // Strict compliance check: Double matching authentication check
    if (appointment.doctorId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Aap is patient ke assigned doctor nahi hain' });
    }

    // Create prescription row item parameters mapping
    const prescription = await Prescription.create({
      appointmentId,
      diagnosis,
      medicines, // Safely handles incoming JSON array structural models inside Postgres
      advice,
      doctorId: req.user.id,
      patientId: appointment.patientId
    });

    // Auto update target appointment configuration trace status
    appointment.status = 'completed';
    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Prescription generated and appointment marked as completed',
      data: prescription
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};