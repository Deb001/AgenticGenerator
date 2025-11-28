import React from 'react';

interface Props {
  signal: 'Buy' | 'Hold' | 'Sell';
}

const colors = {
  Buy: 'bg-green-100 text-green-800',
  Hold: 'bg-yellow-100 text-yellow-800',
  Sell: 'bg-red-100 text-red-800',
};

const SignalBadge: React.FC<Props> = ({ signal }) => {
  return <span className={`px-2 py-1 rounded ${colors[signal]}`}>{signal}</span>;
};

export default SignalBadge;