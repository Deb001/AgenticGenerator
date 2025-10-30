const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Store = require('./Store');

class Employee extends Model {}

Employee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'First name is required' },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Last name is required' },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Phone number is required' },
        is: {
          args: [/^\+?[1-9]\d{1,14}$/],
          msg: 'Phone number must be a valid E.164 format',
        },
      },
    },
    role: {
      type: DataTypes.ENUM('manager', 'associate'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['manager', 'associate']],
          msg: 'Role must be either manager or associate',
        },
      },
    },
    storeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Store,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    modelName: 'Employee',
    tableName: 'employees',
    timestamps: true,
    underscored: true,
  }
);

// Association
Employee.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

module.exports = Employee;