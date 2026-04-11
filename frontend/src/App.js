import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
import { runScoring } from './services/api';

function App() {
  const [user, setUser] = useState(null); 
  const [alerts] = useState([]);
  const [viewMode, setViewMode] = useState('analytics'); // 'analytics' or 'map'
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [simulatedScores, setSimulatedScores] = useState({});
  const [simulateAlerts, setSimulateAlerts] = useState([]);
  const [scoringLoading, setScoringLoading] = useState(false);
  const [scoringMsg, setScoringMsg] = useState('');

  const handleRunScoring = async () => {
    setScoringLoading(true);
    setScoringMsg('');
    try {
      const result = await runScoring();
      setScoringMsg(result.message || '✅ Scoring complete');
    } catch {
      setScoringMsg('❌ Scoring failed — check backend');
    } finally {
      setScoringLoading(false);
      setTimeout(() => setScoringMsg(''), 4000);
    }
  };

  const handleSimulate = (scores) => {
    setSimulatedScores(scores);
    if (Object.keys(scores).length > 0) {
      setSimulateAlerts([{
        id: 'sim',
        district_name: 'Ludhiana',
        risk_score: scores[12] ?? 82,
        risk_level: 'HIGH',
        message: 'Dengue surge predicted (SIMULATED)',
      }]);
    }
  };

  const handleSimulateReset = () => {
    setSimulatedScores({});
    setSimulateAlerts([]);
  };

  return (
    <Router>
      <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f1f5f9', minHeight: '100vh' }}>
        <Routes>
          {/* Login Route */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <LoginPage onLogin={(userData) => setUser(userData)} />} 
          />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/*" 
            element={
              user ? (
                <>
                  <EnhancedHeader alertCount={alerts.length} />

                  <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 24px' }}>
                    
                    <AlertBanner alerts={[...alerts, ...simulateAlerts]} />

                    {/* View Toggle Button */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      margin: '20px 0',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ display: 'flex', gap: '8px', background: '#fff', padding: '6px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <button
                          onClick={() => setViewMode('analytics')}
                          style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            background: viewMode === 'analytics' ? 'linear-gradient(135deg, #0094B3 0%, #006f87 100%)' : 'transparent',
                            color: viewMode === 'analytics' ? '#fff' : '#4A5568',
                            transition: 'all 0.3s ease',
                            boxShadow: viewMode === 'analytics' ? '0 4px 12px rgba(0,148,179,0.3)' : 'none'
                          }}
                        >
                          📊 Analytics Dashboard
                        </button>
                        <button
                          onClick={() => setViewMode('map')}
                          style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            background: viewMode === 'map' ? 'linear-gradient(135deg, #0094B3 0%, #006f87 100%)' : 'transparent',
                            color: viewMode === 'map' ? '#fff' : '#4A5568',
                            transition: 'all 0.3s ease',
                            boxShadow: viewMode === 'map' ? '0 4px 12px rgba(0,148,179,0.3)' : 'none'
                          }}
                        >
                          🗺️ Map Dashboard
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {scoringMsg && <span style={{ fontSize: '12px', color: '#4A5568', fontWeight: '500' }}>{scoringMsg}</span>}
                        <button
                          onClick={handleRunScoring}
                          disabled={scoringLoading}
                          style={{
                            padding: '10px 20px',
                            background: scoringLoading ? '#94a3b8' : '#0094B3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: scoringLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                          }}
                        >
                          {scoringLoading ? <><span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Running…</> : <><span>⚙️</span> Run ML Scoring</>}
                        </button>
                      </div>
                    </div>
                    
                    {/* Analytics Dashboard View */}
                    {viewMode === 'analytics' && (
                      <Routes>
                        {/* Main Dashboard Route */}
                        <Route path="/" element={
                          <>
                            <StatCards />
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
                              <ModelAccuracyPanel />
                              <DiseaseBreakdownChart />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
                              <Top5RiskTable />
                              <DistrictComparison />
                            </div>

                            <DistrictPanel />
                            <SimulateOutbreak onSimulate={handleSimulate} onReset={handleSimulateReset} />
                          </>
                        } />

                        {/* Detail Page Route */}
                        <Route path="/district/:id" element={<DistrictDetail />} />
                      </Routes>
                    )}

                    {/* Map Dashboard View */}
                    {viewMode === 'map' && (
                      <div style={{ 
                        display: 'flex', 
                        gap: '16px',
                        minHeight: '600px'
                      }}>
                        <div style={{ 
                          flex: selectedDistrict ? '0 0 60%' : '1',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          background: '#fff',
                          position: 'relative',
                          minHeight: '600px',
                          transition: 'flex 0.3s ease'
                        }}>
                          <MapDashboard
                            onDistrictSelect={setSelectedDistrict}
                            selectedDistrict={selectedDistrict}
                            simulatedScores={simulatedScores}
                          />
                        </div>

                        {selectedDistrict && (
                          <div style={{ 
                            flex: '0 0 38%',
                            minWidth: '320px',
                            maxWidth: '420px'
                          }}>
                            <DistrictPanel
                              district={selectedDistrict}
                              onClose={() => setSelectedDistrict(null)}
                              simulatedScore={simulatedScores[selectedDistrict.id]}
                            />
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Footer / Logout */}
                  <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 12 }}>
                    Logged in as <strong>{user.name}</strong> ({user.role}) ·{' '}
                    <button onClick={() => setUser(null)} style={{
                      background: 'none', border: 'none', color: '#3b82f6',
                      cursor: 'pointer', fontSize: 12, textDecoration: 'underline'
                    }}>Logout</button>
                  </div>
                </>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;