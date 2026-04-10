import React, { useState } from 'react'; // <-- Yahan 'useState' add kiya hai
import MapDashboard from './components/MapDashboard';
import DistrictPanel from './components/DistrictPanel';
import StatCards from './components/StatCards';
import AlertBanner from './components/AlertBanner';
import SimulateOutbreak from './components/SimulateOutbreak';
import { runScoring } from './services/api';
import './index.css';

export default function App() {
  // Ab ye useState sahi se kaam karega
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
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-left">
          <div className="header-logo">
            <span className="logo-icon">🏥</span>
            <div>
              <div className="logo-title">Disease Outbreak EWS</div>
              <div className="logo-sub">Punjab Early Warning System</div>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="header-badge">Team Rocket</div>
          <div className="header-event">CODEVISTA v1.0</div>
        </div>
      </header>

      {/* ── Alert Banner ── */}
      <AlertBanner extraAlerts={simulateAlerts} />

      {/* ── Stat Cards ── */}
      <div className="stats-section">
        <StatCards />
      </div>

      {/* ── Main Content ── */}
      <main className="main-content">
        <div className={`map-section${selectedDistrict ? ' with-panel' : ''}`}>
          <MapDashboard
            onDistrictSelect={setSelectedDistrict}
            selectedDistrict={selectedDistrict}
            simulatedScores={simulatedScores}
          />
        </div>

        {selectedDistrict && (
          <div className="panel-section-wrapper">
            <DistrictPanel
              district={selectedDistrict}
              onClose={() => setSelectedDistrict(null)}
              simulatedScore={simulatedScores[selectedDistrict.id]}
            />
          </div>
        )}
      </main>

      {/* ── Footer / Controls ── */}
      <footer className="app-footer">
        <div className="footer-left">
          <SimulateOutbreak onSimulate={handleSimulate} onReset={handleSimulateReset} />
        </div>
        <div className="footer-right">
          {scoringMsg && <span className="scoring-msg">{scoringMsg}</span>}
          <button
            className={`run-scoring-btn${scoringLoading ? ' loading' : ''}`}
            onClick={handleRunScoring}
            disabled={scoringLoading}
          >
            {scoringLoading ? (
              <><span className="btn-spinner" />Running…</>
            ) : (
              <><span>⚙️</span> Run ML Scoring</>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}