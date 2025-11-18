import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

/**
 * Signal model representing advisory recommendation for a ticker on a specific date.
 */
export const Signal = sequelize.define('Signal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ticker: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  signal: {
    type: DataTypes.ENUM('Buy', 'Hold', 'Sell'),
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'signals',
  indexes: [{ fields: ['ticker', 'date'] }]
});
