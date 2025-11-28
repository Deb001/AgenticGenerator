export interface Portfolio {
  id: number;
  advisor_id: number;
  client_name: string;
  holdings: string; // JSON string or CSV
  historical_returns: number[];
  created_at: string;
}