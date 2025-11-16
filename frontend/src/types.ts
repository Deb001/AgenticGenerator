/**
 * Shared TypeScript interfaces for the frontend application.
 */

/**
 * Represents a portfolio belonging to a client.
 */
export interface Portfolio {
  /** Unique identifier of the portfolio */
  id: number;
  /** Human‑readable name of the portfolio */
  name: string;
  /** Name of the client that owns the portfolio */
  clientName: string;
  /** ISO timestamp when the portfolio was created */
  createdAt: string;
}

/**
 * Represents a single holding inside a portfolio.
 */
export interface Holding {
  /** Unique identifier of the holding */
  id: number;
  /** Stock ticker symbol, e.g. "AAPL" */
  ticker: string;
  /** Number of shares held */
  quantity: number;
  /** Average purchase price per share */
  averageCost: number;
  /** Current market price per share */
  currentPrice: number;
}

/**
 * Payload returned by the backend when fetching a portfolio with its holdings.
 */
export interface PortfolioDetail extends Portfolio {
  /** Array of holdings belonging to the portfolio */
  holdings: Holding[];
}