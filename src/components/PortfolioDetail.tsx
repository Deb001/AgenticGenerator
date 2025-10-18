import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PortfolioService from '../services/portfolioService';
import advisoryEngine from '../engine/advisoryEngine';
import SignalBadge from './SignalBadge';
import PriceChart from './PriceChart';
import SectorChart from './SectorChart';
import Button from './Button';
import pdfGenerator from '../utils/pdfGenerator';
import { Portfolio, Holding, Signal } from '../types/portfolio';

type SignalsMap = Record<string, Signal>;

const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [signals, setSignals] = useState<SignalsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load portfolio and generate signals
  useEffect(() => {
    const load = async () => {
      try {
        const p = await PortfolioService.getPortfolioById(id);
        if (!p) {
          setError('Portfolio not found.');
          return;
        }
        setPortfolio(p);
        const generated = advisoryEngine.generateSignalsForPortfolio(p.holdings);
        setSignals(generated);
      } catch (e) {
        console.error(e);
        setError('Failed to load portfolio.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Helper: compute sector exposure for chart
  const computeSectorData = (holdings: Holding[]) => {
    const sectorMap: Record<string, number> = {};
    holdings.forEach((h) => {
      const exposure = h.quantity * (h.currentPrice ?? 0);
      sectorMap[h.sector] = (sectorMap[h.sector] ?? 0) + exposure;
    });
    return Object.entries(sectorMap).map(([sector, value]) => ({
      sector,
      value,
    }));
  };

  const handlePdfDownload = async () => {
    if (!portfolio) return;
    try {
      await pdfGenerator.createReport(portfolio, signals);
    } catch (e) {
      console.error(e);
      alert('Error generating PDF report.');
    }
  };

  if (loading) {
    return <div>Loading portfolio...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!portfolio) {
    return null; // should not happen, but satisfies TypeScript
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>{portfolio.name}</h2>

      {/* Holdings Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Ticker</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'right' }}>Quantity</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'right' }}>Current Price</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'center' }}>Signal</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.holdings.map((h) => {
            const signal = signals[h.ticker];
            return (
              <tr key={h.ticker}>
                <td style={{ padding: '0.5rem 0' }}>{h.ticker}</td>
                <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>{h.quantity}</td>
                <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>
                  {h.currentPrice?.toFixed(2) ?? 'N/A'}
                </td>
                <td style={{ padding: '0.5rem 0', textAlign: 'center' }}>
                  {signal ? <SignalBadge signal={signal} /> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Charts */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <PriceChart holdings={portfolio.holdings} />
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <SectorChart data={computeSectorData(portfolio.holdings)} />
        </div>
      </div>

      {/* PDF Export */}
      <div style={{ marginTop: '1.5rem' }}>
        <Button onClick={handlePdfDownload}>Download PDF Report</Button>
      </div>
    </div>
  );
};

export default PortfolioDetail;