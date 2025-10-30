// src/utils/shiftValidator.js

const moment = require('moment');
const ShiftRepository = require('../repositories/ShiftRepository');

const ALLOWED_SHIFT_TYPES = new Set(['morning', 'afternoon', 'night']);
const MAX_SHIFTS_PER_WEEK = 5;

/**
 * Custom error type for validation failures.
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Checks whether the given employee has a shift on the day before or after the supplied date.
 *
 * @param {string} employeeId
 * @param {string} date        // ISO date string (YYYY-MM-DD)
 * @param {string} shiftType   // not used for the consecutive‑day rule but kept for signature compatibility
 * @returns {Promise<boolean>} true if a consecutive shift exists, otherwise false
 */
async function hasConsecutiveShift(employeeId, date, shiftType) {
  const prevDate = moment(date).subtract(1, 'day').format('YYYY-MM-DD');
  const nextDate = moment(date).add(1, 'day').format('YYYY-MM-DD');

  // Repository is expected to expose a method that fetches a shift for an employee on a specific date.
  // If the concrete implementation differs, adjust the call accordingly.
  const [prevShift, nextShift] = await Promise.all([
    ShiftRepository.findShiftByEmployeeAndDate(employeeId, prevDate),
    ShiftRepository.findShiftByEmployeeAndDate(employeeId, nextDate),
  ]);

  return !!(prevShift || nextShift);
}

/**
 * Determines whether the employee would exceed the weekly shift limit if a new shift were added.
 *
 * @param {string} employeeId
 * @param {string} weekStart   // ISO date string (Monday)
 * @param {string} weekEnd     // ISO date string (Sunday)
 * @returns {Promise<boolean>} true if the limit would be exceeded, otherwise false
 */
async function exceedsWeeklyLimit(employeeId, weekStart, weekEnd) {
  const currentCount = await ShiftRepository.countEmployeeShiftsInWeek(
    employeeId,
    weekStart,
    weekEnd
  );

  // Adding the prospective shift would push the total over the allowed maximum.
  return currentCount + 1 > MAX_SHIFTS_PER_WEEK;
}

/**
 * Validates a batch of shift assignments for a particular store and date.
 *
 * @param {string} storeId
 * @param {string} date          // ISO date string (YYYY-MM-DD)
 * @param {Array<Object>} assignments
 *        Each assignment must contain: { employeeId: string, shiftType: string }
 *
 * @throws {ValidationError} if any rule is violated.
 */
async function validateAssignments(storeId, date, assignments) {
  if (!Array.isArray(assignments) || assignments.length === 0) {
    throw new ValidationError('Assignments must be a non‑empty array.');
  }

  // Compute the ISO week (Monday‑Sunday) boundaries for the supplied date.
  const weekStart = moment(date).startOf('isoWeek').format('YYYY-MM-DD');
  const weekEnd = moment(date).endOf('isoWeek').format('YYYY-MM-DD');

  for (const assignment of assignments) {
    const { employeeId, shiftType } = assignment;

    if (!employeeId || typeof employeeId !== 'string') {
      throw new ValidationError('Each assignment must include a valid employeeId.');
    }

    if (!ALLOWED_SHIFT_TYPES.has(shiftType)) {
      throw new ValidationError(
        `Invalid shift type '${shiftType}'. Allowed types are: ${[...ALLOWED_SHIFT_TYPES].join(
          ', '
        )}.`
      );
    }

    // Rule: No consecutive shifts (previous or next day)
    const hasConsecutive = await hasConsecutiveShift(employeeId, date, shiftType);
    if (hasConsecutive) {
      throw new ValidationError(
        `Employee ${employeeId} has a consecutive shift around ${date}.`
      );
    }

    // Rule: Weekly shift limit
    const exceedsLimit = await exceedsWeeklyLimit(employeeId, weekStart, weekEnd);
    if (exceedsLimit) {
      throw new ValidationError(
        `Employee ${employeeId} would exceed the weekly shift limit (${MAX_SHIFTS_PER_WEEK}) for the week ${weekStart}–${weekEnd}.`
      );
    }
  }
}

module.exports = {
  validateAssignments,
  hasConsecutiveShift,
  exceedsWeeklyLimit,
  ValidationError,
};