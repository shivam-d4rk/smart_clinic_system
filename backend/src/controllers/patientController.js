import Appointment from '../models/appointment.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import Prescription from '../models/Prescription.js';



// @desc    Book a new appointment
// @route   POST /api/patient/appointments
export const bookNewAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, slot } = req.body;
    const patientId = req.user.id; // Logged-in user ki ID protection layer se

    // 🌟 Fix: Automatically calculate a random or sequential Token Number
    // Aap chaho toh specific slot count nikal sakte ho, ya simple random integer standard assign kar sakte ho:
    const tokenNumber = Math.floor(1000 + Math.random() * 9000); 

    // Database insertion with tokenNumber included
    const newAppointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      slot,
      tokenNumber, // Missing field payload injected here!
      status: 'scheduled'
    });

    // Optional: Return appointment data along with populated Doctor name if needed by frontend state
    const appointmentWithDetails = await Appointment.findByPk(newAppointment.id, {
      include: [
        { model: User, as: 'Doctor', attributes: ['name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointmentWithDetails || newAppointment
    });

  } catch (error) {
    console.error("[BOOKING ERROR]:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Database booking constraint failure' 
    });
  }
};

// @desc    Get all appointments for the logged-in Patient (With Doctor Details)
// @route   GET /api/patient/appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { patientId: req.user.id },
      include: [
        {
          model: User,
          as: 'Doctor',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['appointmentDate', 'DESC']]
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all prescriptions for the logged-in Patient
// @route   GET /api/patient/prescriptions
export const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      where: { patientId: req.user.id },
      include: [
        {
          model: User,
          as: 'Doctor',
          attributes: ['name', 'email']
        },
        {
          model: Appointment,
          attributes: ['appointmentDate']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getAvailableDoctors = async (req, res) => {
  try {
    const doctorsList = await User.findAll({
      where: { role: 'doctor' },
      attributes: ['id', 'name', 'email']
    });
    return res.status(200).json({ success: true, data: doctorsList });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};