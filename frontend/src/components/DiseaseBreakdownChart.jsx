import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getAggregateStats } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const DiseaseBreakdownChart = () => {
  const [totals, setTotals] = useState({ dengue: 0, malaria: 0, cholera: 0 });
  const [dataDate, setDataDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAggregateStats()
      .then((data) => {
        setTotals({
          dengue: data.dengue_cases || 0,
          malaria: data.malaria_cases || 0,
          cholera: data.cholera_cases || 0,
        });
        setDataDate(data.date);
        if (data.message) {
          console.log('Aggregate stats:', data.message);
        }
      })
      .catch((err) => {
        console.error('Error loading aggregate stats:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const total = totals.dengue + totals.malaria + totals.cholera;

  const chartData = {
    labels: ['Dengue', 'Malaria', 'Cholera'],
    datasets: [{
      data: [totals.dengue, totals.malaria, totals.cholera],
      backgroundColor: ['#f97316', '#8b5cf6', '#06b6d4'],
      hoverBackgroundColor: ['#ea580c', '#7c3aed', '#0891b2'],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16 } },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.raw.toLocaleString()} (${((ctx.raw / total) * 100).toFixed(1)}%)`
        }
      }
    }
  };

  const diseases = [
    { name: 'Dengue',  count: totals.dengue,  color: '#f97316', icon: '🦟' },
    { name: 'Malaria', count: totals.malaria, color: '#8b5cf6', icon: '🩸' },
    { name: 'Cholera', count: totals.cholera, color: '#06b6d4', icon: '💧' },
  ];

  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: 12, padding: 20, margin: '16px 0'
    }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
        Disease Breakdown — Punjab {dataDate ? `(${new Date(dataDate).toLocaleDateString()})` : 'Today'}
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>
        {loading ? 'Loading...' : 
         error ? 'Error loading data' :
         total === 0 ? 'No disease data available' :
         `Total reported: ${total.toLocaleString()} cases across all districts`}
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading disease data...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>Error: {error}</div>
      ) : total === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div>No disease case data available yet.</div>
          <div style={{ fontSize: 12, marginTop: 8 }}>Historical data will appear here after ML scoring runs.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ height: 220, flex: '0 0 220px' }}>
            <Doughnut data={chartData} options={options} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {diseases.map(({ name, count, color, icon }) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#f8fafc', borderRadius: 10, padding: '12px 16px'
              }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{name}</div>
                  <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, marginTop: 4 }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: total > 0 ? `${(count / total * 100).toFixed(1)}%` : '0%',
                      background: color, transition: 'width 0.8s ease'
                    }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                    {count.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {total > 0 ? ((count / total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseBreakdownChart;