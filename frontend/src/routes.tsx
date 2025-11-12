import { RouteObject } from 'react-router-dom';
import Login from './components/Login';
import PortfolioList from './components/PortfolioList';
import PortfolioDetail from './components/PortfolioDetail';

/**
 * Centralised route definitions that can be reused elsewhere (e.g., for navigation menus).
 */
export const routes: RouteObject[] = [
  { path: '/login', element: <Login /> },
  { path: '/portfolios', element: <PortfolioList /> },
  { path: '/portfolios/:id', element: <PortfolioDetail /> }
];