import React from 'react';
import { Route, Navigate, RouteObject } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import PortfolioListPage from '../pages/PortfolioListPage';
import HoldingsDetailPage from '../pages/HoldingsDetailPage';
import SignalDashboardPage from '../pages/SignalDashboardPage';

const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/portfolios" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/portfolios', element: <PortfolioListPage /> },
  { path: '/portfolios/:id/holdings', element: <HoldingsDetailPage /> },
  { path: '/holdings/:id/signals', element: <SignalDashboardPage /> }
];

export default routes.map((r) => (
  <Route key={r.path} path={r.path!} element={r.element} />
));
