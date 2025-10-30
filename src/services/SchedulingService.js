// src/services/SchedulingService.js

const ShiftRepository = require('../repositories/ShiftRepository');
const EmployeeRepository = require('../repositories/EmployeeRepository');
const shiftValidator = require('../utils/shiftValidator');
const notificationQueue = require('../utils/notificationQueue');

/**
 * Custom error types for clearer domain handling.
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ServiceError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ServiceError';
    this.cause = cause;
  }
}

/**
 * SchedulingService
 *
 * Provides static methods to validate shift requests and generate schedules.
 */
class SchedulingService {
  /**
   * Validates a shift request according to business rules.
   *
   * @param {string} storeId
   * @param {string} date      // ISO date string (e.g., '2025-11-01')
   * @param {Array<{shiftType:string, employeeId:string}>} assignments
   * @throws {ValidationError} when any rule is violated
   */
  static async validateShiftRequest(storeId, date, assignments) {
    if (!storeId || typeof storeId !== 'string') {
      throw new ValidationError('Invalid or missing storeId.');
    }
    if (!date || typeof date !== 'string') {
      throw new ValidationError('Invalid or missing date.');
    }
    if (!Array.isArray(assignments) || assignments.length === 0) {
      throw new ValidationError('Assignments must be a non‑empty array.');
    }

    // Validate each assignment individually
    for (const assignment of assignments) {
      const { shiftType, employeeId } = assignment;

      if (!shiftType || typeof shiftType !== 'string') {
        throw new ValidationError('Each assignment must include a valid shiftType.');
      }
      if (!employeeId || typeof employeeId !== 'string') {
        throw new ValidationError('Each assignment must include a valid employeeId.');
      }

      // Verify employee existence
      const employee = await EmployeeRepository.findById(employeeId);
      if (!employee) {
        throw new ValidationError(`Employee with id ${employeeId} does not exist.`);
      }

      // Apply domain‑specific validation rules
      // These validator functions are expected to throw ValidationError on failure.
      await shiftValidator.ensureMaxShiftsPerWeek(employeeId, storeId, date);
      await shiftValidator.ensureNoOverlap(employeeId, storeId, date, shiftType);
      await shiftValidator.ensureNoConsecutive(employeeId, storeId, date, shiftType);
    }
  }

  /**
   * Generates a schedule by persisting shifts and queuing notifications.
   *
   * @param {string} storeId
   * @param {string} date
   * @param {Array<{shiftType:string, employeeId:string}>} assignments
   * @returns {Promise<Array<Object>>} Array of created Shift instances
   * @throws {ValidationError} if validation fails
   * @throws {ServiceError} for repository or queue failures
   */
  static async generateSchedule(storeId, date, assignments) {
    // Step 1: Validate request
    await this.validateShiftRequest(storeId, date, assignments);

    const createdShifts = [];

    try {
      // Step 2: Persist each shift
      for (const { shiftType, employeeId } of assignments) {
        const shift = await ShiftRepository.create({
          storeId,
          date,
          shiftType,
          employeeId,
        });
        createdShifts.push(shift);

        // Step 3: Enqueue notification for the employee
        const message = `You have been assigned to a ${shiftType} shift on ${date} at store ${storeId}.`;
        notificationQueue.enqueue({ employeeId, message });
      }
    } catch (err) {
      // Wrap any lower‑level errors in a ServiceError
      throw new ServiceError('Failed to generate schedule.', err);
    }

    // Step 4: Return created shift records
    return createdShifts;
  }
}

module.exports = {
  SchedulingService,
  ValidationError,
  ServiceError,
};