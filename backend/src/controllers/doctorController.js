import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import User from '../models/User.js';

// Get appointments assigned to the logged-in doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { doctorId: req.user.id },
      include: [{ model: User, as: 'Patient', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create prescription and close appointment status
export const createPrescription = async (req, res) => {
  try {
    const { appointmentId, patientId, medicines } = req.body;
    const doctorId = req.user.id;

    // 1. Write inside Prescription Table
    const newPrescription = await Prescription.create({
      appointmentId,
      patientId,
      doctorId,
      medicines,
      status: 'active'
    });

    // 2. Automatically update the Appointment status to 'completed'
    await Appointment.update(
      { status: 'completed' },
      { where: { id: appointmentId } }
    );

    res.status(201).json({
      success: true,
      message: 'Prescription issued and session archived successfully',
      data: newPrescription
    });
  } catch (error) {
    console.error("[DOCTOR RX FAULT]:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};