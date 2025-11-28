import { Request, Response } from 'express';
import db from '../utils/db';
import { generateSignal } from '../services/signalService';

export const getPortfolios = async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT * FROM portfolios WHERE advisor_id=$1', [
      (req as any).user.userId,
    ]);
    const portfolios = result.rows.map((p) => ({
      ...p,
      signal: generateSignal(p.historical_returns),
    }));
    res.json(portfolios);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch portfolios' });
  }
};

export const getPortfolioById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM portfolios WHERE id=$1 AND advisor_id=$2', [
      id,
      (req as any).user.userId,
    ]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Portfolio not found' });
    const portfolio = result.rows[0];
    portfolio.signal = generateSignal(portfolio.historical_returns);
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
};