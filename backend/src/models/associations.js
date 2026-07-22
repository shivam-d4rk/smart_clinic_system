import User from './User.js';
import Appointment from './appointment.js';
import Prescription from './Prescription.js';

export const setupAssociations = () => {
  // --- User & Appointment Relationships ---
  // A patient can have multiple appointments
  User.hasMany(Appointment, { foreignKey: 'patientId', as: 'PatientAppointments' });
  Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'Patient' });

  // A doctor can have multiple appointments
  User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'DoctorAppointments' });
  Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'Doctor' });

  // --- Prescription Relationships ---
  // A patient has many prescriptions
  User.hasMany(Prescription, { foreignKey: 'patientId', as: 'PatientPrescriptions' });
  Prescription.belongsTo(User, { foreignKey: 'patientId', as: 'Patient' });

  // A doctor writes many prescriptions
  User.hasMany(Prescription, { foreignKey: 'doctorId', as: 'DoctorPrescriptions' });
  Prescription.belongsTo(User, { foreignKey: 'doctorId', as: 'Doctor' });

  // Link between Appointment and Prescription
  Appointment.hasOne(Prescription, { foreignKey: 'appointmentId', as: 'PrescriptionDetails' });
  Prescription.belongsTo(Appointment, { foreignKey: 'appointmentId' });
};