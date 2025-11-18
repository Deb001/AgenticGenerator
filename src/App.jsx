import React from 'react';
import Dashboard from './components/Dashboard';

/**
 * Root component of the Portfolio Advisory Dashboard.
 * Provides a minimal layout with a header and embeds the Dashboard.
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Portfolio Advisory Dashboard
        </h1>
      </header>
      <Dashboard />
    </div>
  );
}

export default App;
