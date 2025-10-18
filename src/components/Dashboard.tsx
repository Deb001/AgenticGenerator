import React from 'react';
import { Outlet } from 'react-router-dom';
import PortfolioList from './PortfolioList';
import ProtectedRoute from '../routes/ProtectedRoute';

/**
 * Dashboard – top‑level advisor view.
 * Renders a sidebar with the list of portfolios and an outlet
 * where the selected portfolio details will appear.
 */
const Dashboard = (): JSX.Element => {
  return (
    <ProtectedRoute>
      <div style={styles.container}>
        <aside style={styles.sidebar}>
          <PortfolioList />
        </aside>
        <main style={styles.main}>
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  sidebar: {
    flex: '0 0 250px',
    borderRight: '1px solid #e0e0e0',
    overflowY: 'auto',
    backgroundColor: '#fafafa',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
  },
};

export default Dashboard;