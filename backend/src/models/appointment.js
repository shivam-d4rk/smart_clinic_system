import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  slot: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'checked-in', 'completed', 'cancelled'),
    defaultValue: 'scheduled',
    allowNull: false
  },
  tokenNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['appointmentDate', 'slot']
    }
  ]
});

export default Appointment;