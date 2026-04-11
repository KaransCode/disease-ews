import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { getModelMetrics } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ModelAccuracyPanel = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModelMetrics()
      .then((data) => {
        setMetrics(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 12, padding: 20, margin: '16px 0',
        textAlign: 'center', color: '#94a3b8'
      }}>
        Loading model metrics...
      </div>
    );
  }

  const metricCards = [
    { label: 'Accuracy',  value: metrics.accuracy, color: '#22c55e' },
    { label: 'Precision', value: metrics.precision, color: '#3b82f6' },
    { label: 'Recall',    value: metrics.recall, color: '#f59e0b' },
    { label: 'F1 Score',  value: metrics.f1_score, color: '#8b5cf6' },
  ];

  const featureImportance = metrics.feature_importance || [];
  const featureData = {
    labels: featureImportance.map(f => f.feature),
    datasets: [{
      label: 'Feature Importance',
      data: featureImportance.map(f => f.importance),
      backgroundColor: ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6'],
      borderRadius: 4,
    }]
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        max: 0.40,
        ticks: {
          callback: v => (v * 100).toFixed(0) + '%',
          font: { size: 11 }
        },
        grid: { color: 'rgba(0,0,0,0.06)' }
      },
      y: { ticks: { font: { size: 11 } }, grid: { display: false } }
    }
  };

  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: 12, padding: 20, margin: '16px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>🤖</span>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
            ML Model Performance
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            XGBoost · Trained on Punjab district data
          </p>
        </div>
        <span style={{
          marginLeft: 'auto', background: '#f0fdf4', color: '#16a34a',
          fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20
        }}>v{metrics.version} PRODUCTION</span>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {metricCards.map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
            borderTop: `3px solid ${color}`
          }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>{value.toFixed(1)}%</div>
            <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 6 }}>
              <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Feature Importance Chart */}
      <div>
        <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#475569' }}>
          Feature Importance (XGBoost gain)
        </p>
        <div style={{ height: 200 }}>
          <Bar data={featureData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default ModelAccuracyPanel;