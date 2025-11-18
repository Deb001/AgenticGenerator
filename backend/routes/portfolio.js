import express from 'express';
import { Portfolio } from '../models/Portfolio.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes in this router.
router.use(authMiddleware);

/**
 * GET /
 * Retrieve all portfolios belonging to the authenticated user.
 */
router.get('/', async (req, res) => {
  try {
    const portfolios = await Portfolio.findAll({ where: { userId: req.user.id } });
    return res.json(portfolios);
  } catch (err) {
    console.error('Fetch portfolios error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /
 * Create a new portfolio for the authenticated user.
 */
router.post('/', async (req, res) => {
  const { clientName, holdings } = req.body;
  if (!clientName || !holdings) {
    return res.status(400).json({ message: 'clientName and holdings are required' });
  }
  try {
    const portfolio = await Portfolio.create({
      clientName,
      holdings,
      userId: req.user.id
    });
    return res.status(201).json(portfolio);
  } catch (err) {
    console.error('Create portfolio error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /:id
 * Update an existing portfolio owned by the user.
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { clientName, holdings } = req.body;
  try {
    const portfolio = await Portfolio.findOne({ where: { id, userId: req.user.id } });
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    if (clientName !== undefined) portfolio.clientName = clientName;
    if (holdings !== undefined) portfolio.holdings = holdings;
    await portfolio.save();
    return res.json(portfolio);
  } catch (err) {
    console.error('Update portfolio error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /:id
 * Delete a portfolio owned by the user.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Portfolio.destroy({ where: { id, userId: req.user.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    return res.json({ message: 'Portfolio deleted successfully' });
  } catch (err) {
    console.error('Delete portfolio error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
