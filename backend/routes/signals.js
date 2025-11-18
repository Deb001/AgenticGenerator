import express from 'express';
import { Signal } from '../models/Signal.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { compute } from '../utils/signalEngine.js';
import { Op } from 'sequelize';

const router = express.Router();
router.use(authMiddleware);

/**
 * GET /:ticker
 * Retrieve latest signals for a ticker. If no signals exist, compute them.
 */
router.get('/:ticker', async (req, res) => {
  const { ticker } = req.params;
  try {
    // Check if we already have recent signals (last 7 days).
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    const existingSignals = await Signal.findAll({
      where: {
        ticker,
        date: { [Op.gte]: recentDate.toISOString().split('T')[0] }
      },
      order: [['date', 'DESC']]
    });

    if (existingSignals.length > 0) {
      return res.json(existingSignals);
    }

    // Compute new signals if none are recent.
    const newSignals = await compute(ticker);
    return res.json(newSignals);
  } catch (err) {
    console.error('Signal retrieval error:', err);
    return res.status(500).json({ message: 'Failed to retrieve signals' });
  }
});

export default router;
