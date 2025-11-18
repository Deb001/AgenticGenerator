import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { User } from './User.js';

/**
 * Portfolio model storing client holdings.
 */
export const Portfolio = sequelize.define('Portfolio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  holdings: {
    // JSONB works with PostgreSQL; fallback to TEXT for other DBs.
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  timestamps: true,
  tableName: 'portfolios'
});

// Define association
User.hasMany(Portfolio, { foreignKey: 'userId', as: 'portfolios' });
Portfolio.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
