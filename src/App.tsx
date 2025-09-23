import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import FarmerDashboard from './components/FarmerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import './App.css';
import { useAuth } from './context/AuthContext';

function RequireAuth({ role, children }: { role: 'farmer' | 'buyer'; children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user || user.role !== role) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/farmer" element={<RequireAuth role="farmer"><FarmerDashboard /></RequireAuth>} />
          <Route path="/buyer" element={<RequireAuth role="buyer"><BuyerDashboard /></RequireAuth>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;