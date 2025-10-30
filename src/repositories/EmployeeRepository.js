/**
 * Repository layer for the Employee model.
 * Provides simple wrappers around Sequelize queries.
 */

const Employee = require('../models/Employee');

class EmployeeRepository {
  /**
   * Find an employee by its primary key.
   * @param {string} id - Employee UUID.
   * @returns {Promise<import('../models/Employee')|null>}
   */
  static async findById(id) {
    return Employee.findByPk(id);
  }

  /**
   * Find an employee by phone number.
   * @param {string} phone - Phone number (unique).
   * @returns {Promise<import('../models/Employee')|null>}
   */
  static async findByPhone(phone) {
    return Employee.findOne({ where: { phone } });
  }

  /**
   * Retrieve all employees that belong to a specific store.
   * @param {string} storeId - Store UUID.
   * @returns {Promise<import('../models/Employee')[]>}
   */
  static async findByStore(storeId) {
    return Employee.findAll({ where: { storeId } });
  }

  /**
   * Create a new employee record.
   * @param {Object} data - Employee fields.
   * @returns {Promise<import('../models/Employee')>}
   */
  static async create(data) {
    return Employee.create(data);
  }
}

module.exports = EmployeeRepository;