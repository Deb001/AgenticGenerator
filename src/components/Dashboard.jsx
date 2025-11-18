import React from 'react';
import PortfolioTable from './PortfolioTable';
import SignalChart from './SignalChart';

/**
 * Dashboard component that arranges the portfolio table and signal chart
 * in a responsive two‑column layout.
 */
function Dashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Portfolio Overview
        </h2>
        <PortfolioTable />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Advisory Signals
        </h2>
        <SignalChart />
      </div>
    </div>
  );
}

export default Dashboard;
