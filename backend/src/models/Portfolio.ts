/**
 * In‑memory portfolio model with mock data.
 * Replace with real DB queries for production.
 */
export interface IHolding {
  symbol: string;
  quantity: number;
  price: number;
  marketValue: number;
}

export interface IPortfolio {
  id: number;
  name: string;
  description: string;
  totalValue: number;
  holdings: IHolding[];
  history: { date: string; value: number }[];
}

export class Portfolio implements IPortfolio {
  id: number;
  name: string;
  description: string;
  totalValue: number;
  holdings: IHolding[];
  history: { date: string; value: number }[];

  private static data: IPortfolio[] = [
    {
      id: 1,
      name: 'Growth Fund',
      description: 'Aggressive growth portfolio focusing on tech stocks.',
      totalValue: 1250000,
      holdings: [
        { symbol: 'AAPL', quantity: 150, price: 170, marketValue: 25500 },
        { symbol: 'TSLA', quantity: 80, price: 250, marketValue: 20000 }
      ],
      history: [
        { date: '2024-01-01', value: 1200000 },
        { date: '2024-02-01', value: 1250000 },
        { date: '2024-03-01', value: 1300000 }
      ]
    },
    {
      id: 2,
      name: 'Income Fund',
      description: 'Stable income generating portfolio with dividend stocks.',
      totalValue: 800000,
      holdings: [
        { symbol: 'KO', quantity: 500, price: 60, marketValue: 30000 },
        { symbol: 'PG', quantity: 200, price: 150, marketValue: 30000 }
      ],
      history: [
        { date: '2024-01-01', value: 790000 },
        { date: '2024-02-01', value: 795000 },
        { date: '2024-03-01', value: 800000 }
      ]
    }
  ];

  private constructor(p: IPortfolio) {
    this.id = p.id;
    this.name = p.name;
    this.description = p.description;
    this.totalValue = p.totalValue;
    this.holdings = p.holdings;
    this.history = p.history;
  }

  static async getAll(): Promise<IPortfolio[]> {
    // Simulate async DB call
    return new Promise(resolve => setTimeout(() => resolve(this.data), 100));
  }

  static async getById(id: number): Promise<IPortfolio | null> {
    const found = this.data.find(p => p.id === id);
    return found ? new Promise(resolve => setTimeout(() => resolve(found), 100)) : null;
  }
}
