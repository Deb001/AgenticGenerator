// src/engine/advisoryEngine.ts

import { Holding, Signal } from '../types/portfolio';

/**
 * Calculates a simple arithmetic mean of the last `period` prices.
 * If there are fewer than `period` entries, the average of the available
 * data is returned. Returns 0 when no price data is present.
 */
export function calculateMovingAverage(
  prices: number[],
  period: number
): number {
  if (period <= 0) return 0;
  if (!prices || prices.length === 0) return 0;

  const slice = prices.slice(-period);
  const count = slice.length;
  if (count === 0) return 0;

  const sum = slice.reduce((acc, p) => acc + p, 0);
  return sum / count;
}

/**
 * Evaluates a single holding and returns a advisory `Signal`.
 *
 * Rules:
 *  - Compute 20‑day moving average (MA).
 *  - If currentPrice > MA * 1.05 → Buy
 *  - Else if currentPrice < MA * 0.95 → Sell
 *  - Else → Hold
 *  - If sectorPotential flag is 'HighGrowth' and signal is Hold → upgrade to Buy.
 *  - If buzzTags contain 'Negative' and signal is Buy → downgrade to Hold.
 */
export function evaluateHolding(holding: Holding): Signal {
  const ma = calculateMovingAverage(holding.historicalPrices ?? [], 20);

  // Base signal derived from price vs MA
  let signal: Signal = 'Hold';
  const price = holding.currentPrice ?? 0;

  if (ma > 0) {
    if (price > ma * 1.05) {
      signal = 'Buy';
    } else if (price < ma * 0.95) {
      signal = 'Sell';
    }
  }

  // Sector‑potential upgrade
  if (
    signal === 'Hold' &&
    holding.sectorPotential?.toLowerCase() === 'highgrowth'
  ) {
    signal = 'Buy';
  }

  // Buzz‑tag downgrade
  if (
    signal === 'Buy' &&
    holding.buzzTags?.some((tag) => tag.toLowerCase() === 'negative')
  ) {
    signal = 'Hold';
  }

  return signal;
}

/**
 * Generates advisory signals for an entire portfolio.
 * Returns a map keyed by holding ticker symbol.
 */
export function generateSignalsForPortfolio(
  holdings: Holding[]
): Record<string, Signal> {
  const result: Record<string, Signal> = {};

  holdings.forEach((h) => {
    if (h && h.ticker) {
      result[h.ticker] = evaluateHolding(h);
    }
  });

  return result;
}