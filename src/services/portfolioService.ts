// src/services/portfolioService.ts

import { Portfolio, Holding } from '../types/portfolio';
import dummyPortfolios from './../data/dummyPortfolios';

/**
 * Singleton service that manages an in‑memory list of portfolios.
 * All modifications are lost on page reload – suitable for MVP.
 */
class PortfolioService {
  private static _instance: PortfolioService;
  private _portfolios: Portfolio[] = [];

  private constructor() {
    // Clone the dummy data to avoid accidental mutation of the source array.
    this._portfolios = dummyPortfolios.map(p => ({
      ...p,
      holdings: p.holdings?.map(h => ({ ...h })) ?? [],
    }));
  }

  /** Retrieve the singleton instance. */
  public static get instance(): PortfolioService {
    if (!this._instance) {
      this._instance = new PortfolioService();
    }
    return this._instance;
  }

  /** Returns a shallow copy of the portfolio list. */
  public getAllPortfolios(): Portfolio[] {
    return [...this._portfolios];
  }

  /** Finds a portfolio by its id. */
  public getPortfolioById(id: string): Portfolio | undefined {
    return this._portfolios.find(p => p.id === id);
  }

  /** Adds a new portfolio to the collection. */
  public addPortfolio(portfolio: Portfolio): void {
    this._portfolios.push(portfolio);
  }

  /**
   * Merges updates into an existing portfolio.
   * Returns true if the portfolio was found and updated, false otherwise.
   */
  public updatePortfolio(id: string, updates: Partial<Portfolio>): boolean {
    const idx = this._portfolios.findIndex(p => p.id === id);
    if (idx === -1) return false;

    const existing = this._portfolios[idx];
    const merged: Portfolio = {
      ...existing,
      ...updates,
    };

    // Preserve holdings array unless explicitly overwritten.
    if (updates.holdings) {
      merged.holdings = updates.holdings;
    } else {
      merged.holdings = existing.holdings;
    }

    this._portfolios[idx] = merged;
    return true;
  }

  /**
   * Removes a portfolio by id.
   * Returns true if a portfolio was removed, false otherwise.
   */
  public deletePortfolio(id: string): boolean {
    const idx = this._portfolios.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this._portfolios.splice(idx, 1);
    return true;
  }
}

// Export the singleton instance for use throughout the app.
export default PortfolioService.instance;