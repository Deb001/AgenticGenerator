/**
 * Shared TypeScript interfaces for API payloads and domain objects.
 */

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_advisor: boolean;
}

export interface Holding {
  ticker: string;
  quantity: number;
  avg_price: number;
  last_price: number;
}

export interface Transaction {
  id: number;
  ticker: string;
  quantity: number;
  price: number;
  date: string;
}

export interface Portfolio {
  id: number;
  client_name: string;
  created_at: string;
  holdings: Holding[];
  transactions: Transaction[];
}

export interface AdvisorySignal {
  signal_type: 'BUY' | 'HOLD' | 'SELL';
  confidence: number;
  rationale: string;
  signal_date: string;
}
