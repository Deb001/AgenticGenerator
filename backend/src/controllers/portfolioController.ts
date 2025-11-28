import { Request, Response, NextFunction } from 'express';
import { Portfolio } from '../models/Portfolio';

/**
 * GET /api/portfolios
 */
export const getAllPortfolios = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const portfolios = await Portfolio.getAll();
    res.json(portfolios);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/portfolios/:id
 */
export const getPortfolioById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid portfolio ID' });
    }
    const portfolio = await Portfolio.getById(id);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    res.json(portfolio);
  } catch (err) {
    next(err);
  }
};
