import React, { useState } from 'react';
import SignalChart from './SignalChart';
import api from '../services/api';

interface Props {
  portfolio: any;
}

/**
 * Shows portfolio details and allows the user to generate advisory signals.
 */
const PortfolioDetail: React.FC<Props> = ({ portfolio }) => {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/portfolios/${portfolio.id}/signals`);
      setSignals(res.data);
    } catch (err) {
      console.error('Failed to fetch signals:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow p-4 col-span-2'>
      <h2 className='text-2xl font-semibold mb-4 text-primary'>{portfolio.name}</h2>
      <button
        onClick={fetchSignals}
        className='mb-4 bg-accent text-white px-4 py-2 rounded hover:bg-secondary transition'
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Signals'}
      </button>
      {signals.length > 0 && <SignalChart data={signals} />}
    </div>
  );
};

export default PortfolioDetail;
