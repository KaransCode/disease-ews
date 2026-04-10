import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Existing & New components
import AlertBanner from './components/AlertBanner';
import StatCards from './components/StatCards';
import MapDashboard from './components/MapDashboard';
import DistrictPanel from './components/DistrictPanel';
import SimulateOutbreak from './components/SimulateOutbreak';
import LoginPage from './components/LoginPage';
import EnhancedHeader from './components/EnhancedHeader';
import ModelAccuracyPanel from './components/ModelAccuracyPanel';
import DiseaseBreakdownChart from './components/DiseaseBreakdownChart';
import Top5RiskTable from './components/Top5RiskTable';
import DistrictComparison from './components/DistrictComparison';
import DistrictDetail from './components/DistrictDetail';

function App() {
  const [user, setUser] = useState(null); 
  const [alerts] = useState([]);

  // 1. Agar user login nahi hai, toh seedha Login Page dikhao
  if (!user) {
    return <LoginPage onLogin={(userData) => setUser(userData)} />;
  }

  // 2. Agar login hai, toh poora app Router ke andar hona chahiye
  return (
    <Router>
      <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f1f5f9', minHeight: '100vh' }}>
        
        <EnhancedHeader alertCount={alerts.length} />

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 24px' }}>
          
          <AlertBanner alerts={alerts} />
          
          <Routes>
            {/* Main Dashboard Route */}
            <Route path="/" element={
              <>
                <StatCards />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
                  <ModelAccuracyPanel />
                  <DiseaseBreakdownChart />
                </div>

                <MapDashboard />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
                  <Top5RiskTable />
                  <DistrictComparison />
                </div>

                <DistrictPanel />
                <SimulateOutbreak />
              </>
            } />

            {/* Detail Page Route */}
            <Route path="/district/:id" element={<DistrictDetail />} />
          </Routes>

        </div>

        {/* Footer / Logout */}
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 12 }}>
          Logged in as <strong>{user.name}</strong> ({user.role}) ·{' '}
          <button onClick={() => setUser(null)} style={{
            background: 'none', border: 'none', color: '#3b82f6',
            cursor: 'pointer', fontSize: 12, textDecoration: 'underline'
          }}>Logout</button>
        </div>
      </div>
    </Router>
  );
}

export default App;