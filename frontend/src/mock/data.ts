export const mockPortfolios = [
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
      { date: '2024-01-01', value: 1_200_000 },
      { date: '2024-02-01', value: 1_250_000 },
      { date: '2024-03-01', value: 1_300_000 }
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
      { date: '2024-01-01', value: 790_000 },
      { date: '2024-02-01', value: 795_000 },
      { date: '2024-03-01', value: 800_000 }
    ]
  }
];
