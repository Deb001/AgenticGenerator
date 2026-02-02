export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
export const GOOGLE_OAUTH_URL = `${API_BASE_URL}/api/auth/google/login`;

export enum RiskTolerance {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export type RegisterPayload = {
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type Profile = {
  investmentGoal: string;
  riskTolerance: RiskTolerance;
};

export type PortfolioItem = {
  id: string;
  ticker: string;
  quantity: number;
  avgCost: number;
  currentValue: number; // calculated on backend
};

export type Portfolio = {
  id: string;
  name: string;
  type: string; // e.g., Core, Growth
  items?: PortfolioItem[];
};
