// src/data/dummyPortfolios.ts
import { Portfolio } from './../types/portfolio';

/**
 * Sample price history for a holding.
 * Dates are ISO strings (YYYY-MM-DD) and prices are in INR.
 */
const priceHistorySample = (base: number): { date: string; price: number }[] => [
  { date: '2024-10-14', price: base * 0.98 },
  { date: '2024-10-15', price: base * 0.99 },
  { date: '2024-10-16', price: base },
  { date: '2024-10-17', price: base * 1.02 },
  { date: '2024-10-18', price: base * 1.03 },
];

/**
 * Dummy portfolios used to seed the in‑memory store.
 */
export const dummyPortfolios: Portfolio[] = [
  {
    id: 'portfolio-001',
    clientName: 'Growth Fund',
    holdings: [
      {
        ticker: 'RELIANCE.NS',
        name: 'Reliance Industries Ltd.',
        sector: 'Energy',
        quantity: 150,
        priceHistory: priceHistorySample(2500),
        buzzTags: ['Sector rally', 'Strong earnings'],
      },
      {
        ticker: 'INFY.NS',
        name: 'Infosys Ltd.',
        sector: 'Technology',
        quantity: 300,
        priceHistory: priceHistorySample(1700),
        buzzTags: ['Digital transformation', 'Positive analyst outlook'],
      },
    ],
  },
  {
    id: 'portfolio-002',
    clientName: 'Value Fund',
    holdings: [
      {
        ticker: 'HDFCBANK.NS',
        name: 'HDFC Bank Ltd.',
        sector: 'Financials',
        quantity: 200,
        priceHistory: priceHistorySample(1600),
        buzzTags: ['Stable dividend', 'Regulatory risk'],
      },
      {
        ticker: 'TCS.NS',
        name: 'Tata Consultancy Services Ltd.',
        sector: 'Technology',
        quantity: 120,
        priceHistory: priceHistorySample(3400),
        buzzTags: ['Strong earnings', 'Global contracts'],
      },
    ],
  },
];