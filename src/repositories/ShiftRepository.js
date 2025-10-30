// src/repositories/ShiftRepository.js

const { Op, UniqueConstraintError } = require('sequelize');
const Shift = require('../models/Shift');
const ConflictError = require('../errors/ConflictError');

class ShiftRepository {
  /**
   * Create a new shift record.
   * @param {Object} shiftData - Data for the new shift.
   * @returns {Promise<Shift>}
   * @throws {ConflictError} When a unique constraint violation occurs.
   */
  static async create(shiftData) {
    try {
      const shift = await Shift.create(shiftData);
      return shift;
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        throw new ConflictError('Shift already exists with the provided unique fields.');
      }
      throw err;
    }
  }

  /**
   * Find a shift by its primary key.
   * @param {string} id - Shift identifier.
   * @returns {Promise<Shift|null>}
   */
  static async findById(id) {
    return Shift.findByPk(id);
  }

  /**
   * Retrieve all shifts for a specific store on a given date.
   * @param {string} storeId - Store identifier.
   * @param {string} date - Date string (YYYY-MM-DD).
   * @returns {Promise<Shift[]>}
   */
  static async findByStoreAndDate(storeId, date) {
    return Shift.findAll({
      where: {
        storeId,
        date: {
          [Op.eq]: date,
        },
      },
    });
  }

  /**
   * Count the number of shifts an employee has within a week.
   * @param {string} employeeId - Employee identifier.
   * @param {string} weekStart - Start date of the week (inclusive, YYYY-MM-DD).
   * @param {string} weekEnd - End date of the week (inclusive, YYYY-MM-DD).
   * @returns {Promise<number>}
   */
  static async countEmployeeShiftsInWeek(employeeId, weekStart, weekEnd) {
    return Shift.count({
      where: {
        employeeId,
        date: {
          [Op.between]: [weekStart, weekEnd],
        },
      },
    });
  }

  /**
   * Delete a shift by its identifier.
   * @param {string} id - Shift identifier.
   * @returns {Promise<number>} Number of rows deleted (0 or 1).
   */
  static async delete(id) {
    return Shift.destroy({
      where: { id },
    });
  }
}

module.exports = ShiftRepository;