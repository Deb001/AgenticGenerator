import { Signal } from '../models/Signal.js';
import { Op } from 'sequelize';

/**
 * Simulated function to fetch historical price data.
 * In a real implementation this would call an external market data API.
 *
 * @param {string} ticker - Stock ticker symbol.
 * @returns {Promise<Array<{date:string, close:number}>>}
 */
const fetchHistoricalPrices = async (ticker) => {
  // Generate 30 days of mock data.
  const today = new Date();
  const data = [];
  let price = 100; // start price
  for (let i = 30; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    // Simulate random walk.
    price += (Math.random() - 0.5) * 2; // +/- $1
    price = Math.max(price, 1);
    data.push({ date: date.toISOString().split('T')[0], close: parseFloat(price.toFixed(2)) });
  }
  return data;
};

/**
 * Compute simple moving average crossover signals.
 * Generates a Signal record for each day where a crossover occurs.
 *
 * @param {string} ticker - Stock ticker.
 * @returns {Promise<Array<Signal>>} - Array of created Signal instances.
 */
export const compute = async (ticker) => {
  try {
    const prices = await fetchHistoricalPrices(ticker);
    if (prices.length < 10) {
      throw new Error('Not enough data to compute signals');
    }

    // Helper to calculate SMA.
    const sma = (arr, period, idx) => {
      const slice = arr.slice(idx - period + 1, idx + 1);
      const sum = slice.reduce((acc, cur) => acc + cur.close, 0);
      return sum / period;
    };

    const signals = [];
    for (let i = 9; i < prices.length; i++) { // start at index 9 for 10‑day SMA
      const sma5 = sma(prices, 5, i);
      const sma10 = sma(prices, 10, i);
      let signalType = 'Hold';
      if (sma5 > sma10) {
        signalType = 'Buy';
      } else if (sma5 < sma10) {
        signalType = 'Sell';
      }
      const signalRecord = await Signal.create({
        ticker,
        date: prices[i].date,
        signal: signalType
      });
      signals.push(signalRecord);
    }
    return signals;
  } catch (err) {
    console.error('Signal engine error:', err);
    throw err;
  }
};
