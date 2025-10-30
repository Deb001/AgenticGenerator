const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Employee = require('./Employee');
const Store = require('./Store');

class Shift extends Model {}

Shift.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    shiftType: {
      type: DataTypes.ENUM('morning', 'afternoon', 'evening'),
      allowNull: false,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Employee,
        key: 'id',
      },
    },
    storeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Store,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Shift',
    tableName: 'Shifts',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['date', 'shiftType', 'storeId'],
      },
    ],
  }
);

// Associations
Shift.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Shift.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

module.exports = Shift;