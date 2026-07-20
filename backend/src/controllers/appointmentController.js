import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// @desc    Get all appointments for the logged-in Doctor (With Patient Details)
// @route   GET /api/appointments/doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    // SQL JOIN Operation: Appointment find karein jahan doctorId matching ho
    // aur sath me Patient table se sirf name, email aur phone pull karein
    const appointments = await Appointment.findAll({
      where: { doctorId: req.user.id },
      include: [
        {
          model: User,
          as: 'Patient',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['appointmentDate', 'ASC'], ['slot', 'ASC']]
    });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Appointment Status (e.g., Checked-In, Completed)
// @route   PUT /api/appointments/:id/status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment nahi mila' });
    }

    // Security Check: Kya ye appointment isi doctor ka hai?
    if (appointment.doctorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};