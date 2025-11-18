import { AppDataSource } from '../../ormconfig';
import { PriceHistory } from '../entities/PriceHistory';
import { AdvisorySignal } from '../entities/AdvisorySignal';
import { Holding } from '../entities/Holding';

/**
 * Simple SMA‑based advisory algorithm.
 * If 20‑day SMA > 50‑day SMA => BUY, < => SELL, otherwise HOLD.
 */
export const generateSignals = async (portfolioId: number): Promise<AdvisorySignal[]> => {
  const priceRepo = AppDataSource.getRepository(PriceHistory);
  const signalRepo = AppDataSource.getRepository(AdvisorySignal);
  const holdingRepo = AppDataSource.getRepository(Holding);

  // Fetch holdings belonging to the portfolio
  const holdings = await holdingRepo.find({ where: { portfolio: { id: portfolioId } } });
  const symbols = holdings.map((h) => h.symbol);

  const results: AdvisorySignal[] = [];

  for (const symbol of symbols) {
    const prices = await priceRepo.find({
      where: { symbol },
      order: { date: 'ASC' },
      take: 60,
    });
    if (prices.length < 60) continue; // Not enough data

    const sma20 = prices.slice(-20).reduce((sum, p) => sum + Number(p.close), 0) / 20;
    const sma50 = prices.slice(-50).reduce((sum, p) => sum + Number(p.close), 0) / 50;

    let recommendation: 'Buy' | 'Hold' | 'Sell' = 'Hold';
    if (sma20 > sma50) recommendation = 'Buy';
    else if (sma20 < sma50) recommendation = 'Sell';

    const signal = signalRepo.create({
      portfolioId,
      symbol,
      recommendation,
      generatedAt: new Date(),
    });
    await signalRepo.save(signal);
    results.push(signal);
  }

  return results;
};