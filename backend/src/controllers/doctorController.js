import { Op } from 'sequelize';
import Appointment from '../models/appointment.js';
import Prescription from '../models/Prescription.js';
import User from '../models/User.js';

// Get all registered doctors for dropdowns (Case-Insensitive Role Search)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: {
        // 'doctor', 'Doctor', 'DOCTOR' sabhi roles ko match karega
        role: {
          [Op.iLike || Op.like]: 'doctor'
        }
      },
      attributes: ['id', 'name', 'email', 'specialization', 'department']
    });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error("[GET DOCTORS FAULT]:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch doctors list",
      error: error.message 
    });
  }
};

// Get appointments assigned to the logged-in doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    // Ensure logged-in user context exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: Doctor ID not found in session token' 
      });
    }

    const doctorId = req.user.id;

    const appointments = await Appointment.findAll({
      where: { doctorId: doctorId },
      include: [
        { 
          model: User, 
          as: 'Patient', 
          attributes: ['id', 'name', 'email', 'phone'] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ 
      success: true, 
      count: appointments.length,
      data: appointments 
    });
  } catch (error) {
    console.error("[DOCTOR APPOINTMENTS FAULT]:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch assigned clinical logs from server",
      error: error.message 
    });
  }
};

// Create prescription and close appointment status
export const createPrescription = async (req, res) => {
  try {
    const { appointmentId, patientId, medicines } = req.body;
    const doctorId = req.user.id;

    if (!appointmentId || !patientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing appointmentId or patientId' 
      });
    }

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

    return res.status(201).json({
      success: true,
      message: 'Prescription issued and session archived successfully',
      data: newPrescription
    });
  } catch (error) {
    console.error("[DOCTOR RX FAULT]:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};