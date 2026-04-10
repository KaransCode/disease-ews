import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [simulatedScores, setSimulatedScores] = useState({});

  return (
    <Router>
      {!user ? (
        <LoginPage onLogin={(userData) => setUser(userData)} />
      ) : (
        <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f1f5f9', minHeight: '100vh' }}>
          
          <EnhancedHeader alertCount={alerts.length} />

          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 24px' }}>
            <AlertBanner alerts={alerts} />
            
            <Routes>
              <Route path="/" element={
                <>
                  <StatCards />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
                    <ModelAccuracyPanel />
                    <DiseaseBreakdownChart />
                  </div>

                  {/* ✅ Map + Panel side by side */}
                  <div style={{ display: 'flex', gap: 16, margin: '16px 0' }}>
                    <div style={{ flex: 1 }}>
                      <MapDashboard
                        onDistrictSelect={setSelectedDistrict}
                        selectedDistrict={selectedDistrict}
                        simulatedScores={simulatedScores}
                      />
                    </div>
                    {selectedDistrict && (
                      <div style={{ flex: '0 0 380px' }}>
                        <DistrictPanel
                          district={selectedDistrict}
                          onClose={() => setSelectedDistrict(null)}
                          simulatedScore={simulatedScores[selectedDistrict.id]}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
                    <Top5RiskTable />
                    <DistrictComparison />
                  </div>

                  <SimulateOutbreak
                    onSimulate={setSimulatedScores}
                    onReset={() => setSimulatedScores({})}
                  />
                </>
              } />
              <Route path="/district/:id" element={<DistrictDetail />} />
            </Routes>
          </div>

          <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 12 }}>
            Logged in as <strong>{user.name}</strong> ({user.role}) ·{' '}
            <button onClick={() => setUser(null)} style={{
              background: 'none', border: 'none', color: '#3b82f6',
              cursor: 'pointer', fontSize: 12, textDecoration: 'underline'
            }}>Logout</button>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;