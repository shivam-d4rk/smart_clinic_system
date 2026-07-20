import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  medicines: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  advice: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

export default Prescription;