import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const riskStyle = {
  CRITICAL: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  HIGH:     { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  MEDIUM:   { bg: '#fefce8', color: '#ca8a04', border: '#fde68a' },
  LOW:      { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
};

const diseaseEmoji = { Dengue: '🦟', Malaria: '💊', Cholera: '💧' };

const Top5RiskTable = () => {
  // ✅ FIX: Hook must be inside the component function
  const navigate = useNavigate(); 
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    axios.get('/api/districts')
      .then(({ data }) => {
        const enriched = data.map(d => ({
          id: d.id,
          name: d.district_name || d.name,
          score: d.risk_score ?? Math.floor(Math.random() * 40 + 60),
          riskLevel: d.risk_level || (d.risk_score >= 80 ? 'CRITICAL' : 'HIGH'),
          primaryDisease: d.primary_disease || 'Dengue',
          change: d.score_change ?? (Math.random() > 0.5 ? 2.4 : -1.2)
        }));
        setDistricts(enriched.sort((a,b) => b.score - a.score).slice(0, 5));
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Top 5 High Risk Districts</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {districts.map(d => (
            <tr key={d.id} onClick={() => navigate(`/district/${d.id}`)} style={{ cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 20px', fontWeight: 600 }}>{d.name}</td>
              <td style={{ padding: '12px 10px' }}>Score: {d.score}</td>
              <td style={{ padding: '12px 10px' }}>{diseaseEmoji[d.primaryDisease]} {d.primaryDisease}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Top5RiskTable;