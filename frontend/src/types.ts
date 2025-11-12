export interface Holding {
  id: number;
  ticker: string;
  quantity: number;
}

export interface PortfolioRead {
  id: number;
  name: string;
  holdings: Holding[];
}

export type AdvisorySignalType = 'Buy' | 'Hold' | 'Sell';

export interface AdvisorySignal {
  ticker: string;
  signal: AdvisorySignalType;
  confidence: number;
}

export interface AdvisoryResponse {
  signals: AdvisorySignal[];
}

export interface Token {
  access_token: string;
  token_type?: string;
}