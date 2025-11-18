import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RouteConfig from './routes/index';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <main className="flex-1 container mx-auto p-4">
          <Routes>{RouteConfig}</Routes>
        </main>
        <footer className="bg-primary text-white text-center py-2">
          © 2025 Portfolio Advisory
        </footer>
      </div>
    </Router>
  );
};

export default App;
