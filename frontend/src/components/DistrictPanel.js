import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getDistrictStats } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

// ✅ Defined locally
const getRiskColor = (score) => {
  if (score >= 75) return '#D0293C';
  if (score >= 50) return '#C87000';
  return '#1A7A4A';
};

const riskLabel = (score) => {
  if (score >= 75) return 'HIGH';
  if (score >= 50) return 'MODERATE';
  return 'LOW';
};

const Spinner = () => (
  <div className="panel-spinner">
    <div className="spinner" />
  </div>
);

export default function DistrictPanel({ district, onClose, simulatedScore }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!district) return;
    setLoading(true);
    getDistrictStats(district.id).then(data => {
      setStats(data.stats);
      setLoading(false);
    });
  }, [district]);

  if (!district) return null;

  const score = simulatedScore ?? district.score;
  const riskColor = getRiskColor(score);
  const riskLvl = riskLabel(score);
  const latest = stats?.[stats.length - 1];

  const chartData = stats ? {
    labels: stats.map(s => s.date.slice(5)),
    datasets: [{
      label: 'OPD Cases',
      data: stats.map(s => s.opd_cases),
      borderColor: riskColor,
      backgroundColor: riskColor + '22',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: riskColor,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 10 } } },
    },
  };

  return (
    <div className="district-panel">
      <div className="panel-header" style={{ borderLeftColor: riskColor }}>
        <div>
          <h2 className="panel-district-name">{district.name}</h2>
          <span className="panel-state">Punjab, India</span>
        </div>
        <button className="panel-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {loading ? <Spinner /> : (
        <div className="panel-body">
          <div className="risk-badge-row">
            <div className="risk-score-badge" style={{ background: riskColor + '18', border: `2px solid ${riskColor}` }}>
              <span className="risk-score-num" style={{ color: riskColor }}>{score}</span>
              <span className="risk-score-max">/100</span>
            </div>
            <div className="risk-info">
              <div className="risk-level-pill" style={{ background: riskColor, color: '#fff' }}>
                {riskLvl} RISK
              </div>
              <div className="risk-disease">🦟 {district.primary_disease} surge predicted</div>
              <div className="risk-confidence">
                <span className="conf-dot" style={{ background: riskColor }} />
                {district.confidence}% model confidence
              </div>
            </div>
          </div>

          <div className="panel-section">
            <h3 className="panel-section-title">14-Day OPD Case Trend</h3>
            <div className="chart-container">
              {chartData && <Line data={chartData} options={chartOptions} />}
            </div>
          </div>

          {latest && (
            <div className="panel-section">
              <h3 className="panel-section-title">Latest Conditions</h3>
              <div className="weather-row">
                <div className="weather-item">
                  <span className="weather-icon">🌧️</span>
                  <span className="weather-value">{latest.rainfall_mm} mm</span>
                  <span className="weather-label">Rainfall</span>
                </div>
                <div className="weather-item">
                  <span className="weather-icon">🌡️</span>
                  <span className="weather-value">{latest.temp_max}°C</span>
                  <span className="weather-label">Max Temp</span>
                </div>
                <div className="weather-item">
                  <span className="weather-icon">💧</span>
                  <span className="weather-value">{latest.humidity}%</span>
                  <span className="weather-label">Humidity</span>
                </div>
              </div>
            </div>
          )}

          {latest && (
            <div className="panel-section">
              <h3 className="panel-section-title">Hospital Load</h3>
              <div className="hospital-load-bar-wrapper">
                <div className="hospital-load-track">
                  <div
                    className="hospital-load-fill"
                    style={{
                      width: `${latest.hospital_load}%`,
                      background: `linear-gradient(90deg, ${riskColor}88, ${riskColor})`,
                    }}
                  />
                </div>
                <span className="hospital-load-pct" style={{ color: riskColor }}>
                  {latest.hospital_load}%
                </span>
              </div>
            </div>
          )}

          <a className="view-history-btn" href={`/district/${district.id}`}
            style={{ borderColor: riskColor, color: riskColor }}>
            View Full History →
          </a>
        </div>
      )}
    </div>
  );
}