const express = require('express');
const SchedulingService = require('../services/SchedulingService');
const ShiftRepository = require('../repositories/ShiftRepository');
const auth = require('../middleware/auth');

const router = express.Router();

// Simple async wrapper to forward errors to Express error handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * POST /api/schedules
 * Create a schedule (manager only)
 */
router.post(
  '/',
  auth.verifyToken,
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'manager') {
      return res.status(403).json({ error: 'Forbidden: managers only' });
    }

    const { storeId, date, assignments } = req.body;

    if (!storeId || !date || !Array.isArray(assignments)) {
      return res
        .status(400)
        .json({ error: 'Missing or invalid storeId, date, or assignments' });
    }

    // Delegate schedule generation to the service layer
    const createdShifts = await SchedulingService.generateSchedule(
      storeId,
      date,
      assignments
    );

    return res.status(201).json({ shifts: createdShifts });
  })
);

/**
 * GET /api/schedules?storeId=&date=
 * List shifts (manager & employee)
 */
router.get(
  '/',
  auth.verifyToken,
  asyncHandler(async (req, res) => {
    const { storeId, date } = req.query;

    if (!storeId || !date) {
      return res
        .status(400)
        .json({ error: 'Missing required query parameters: storeId, date' });
    }

    // Retrieve all shifts for the store and date
    const shifts = await ShiftRepository.findByStoreAndDate(storeId, date);

    // Employees may only see their own shifts
    const user = req.user;
    let filteredShifts = shifts;
    if (user && user.role !== 'manager') {
      filteredShifts = shifts.filter(
        (shift) => shift.employeeId === user.id
      );
    }

    return res.status(200).json({ shifts: filteredShifts });
  })
);

/**
 * DELETE /api/schedules/:id
 * Delete a shift (manager only)
 */
router.delete(
  '/:id',
  auth.verifyToken,
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'manager') {
      return res.status(403).json({ error: 'Forbidden: managers only' });
    }

    const shiftId = parseInt(req.params.id, 10);
    if (isNaN(shiftId)) {
      return res.status(400).json({ error: 'Invalid shift ID' });
    }

    const deletedCount = await ShiftRepository.delete(shiftId);
    if (!deletedCount) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    return res.sendStatus(204);
  })
);

module.exports = router;