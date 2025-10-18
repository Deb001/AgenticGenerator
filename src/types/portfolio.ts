/**
 * Types describing the core domain objects for the advisory application.
 *
 * These interfaces are imported throughout the codebase (services, engine,
 * UI components) to ensure type‑safety. Any change to the shape of these
 * objects must be reflected in the dummy data, service layer and UI.
 */

/**
 * Represents a single equity holding within a client portfolio.
 */
export interface Holding {
  /** Ticker symbol, e.g. "INFY". */
  ticker: string;
  /** Full company name, e.g. "Infosys Limited". */
  companyName: string;
  /** Number of shares owned. */
  quantity: number;
  /** Average purchase cost per share (in INR). */
  averageCost: number;
  /** Current market price per share (in INR). */
  currentPrice: number;
  /** Sector classification, e.g. "Technology". */
  sector: string;
  /** Historical closing prices (most recent last). */
  historicalPrices: number[];
  /** Market buzz tags associated with the holding, e.g. ["earnings", "buyback"]. */
  buzzTags: string[];
}

/**
 * Advisory signal generated for a holding.
 */
export interface Signal {
  /** Decision type – Buy, Hold, or Sell. */
  type: 'Buy' | 'Hold' | 'Sell';
  /** Human‑readable justification for the signal. */
  reason: string;
}

/**
 * Represents a client portfolio containing multiple holdings.
 */
export interface Portfolio {
  /** Unique identifier for the portfolio (UUID or similar). */
  id: string;
  /** Name of the client who owns the portfolio. */
  clientName: string;
  /** Array of equity holdings. */
  holdings: Holding[];
}