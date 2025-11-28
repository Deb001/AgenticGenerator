export const generateSignal = (returns: number[]): 'Buy' | 'Hold' | 'Sell' => {
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  if (avg > 0.001) return 'Buy';
  if (avg < -0.001) return 'Sell';
  return 'Hold';
};