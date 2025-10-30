import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Store extends Model {
  static associate(models) {
    // A Store has many Employees
    Store.hasMany(models.Employee, {
      foreignKey: 'storeId',
      as: 'employees',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

Store.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Store',
    tableName: 'stores',
    timestamps: true,
  }
);

export default Store;