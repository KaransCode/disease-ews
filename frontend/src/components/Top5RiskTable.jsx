import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDistricts } from '../services/api';


const diseaseEmoji = { Dengue: '🦟', Malaria: '💊', Cholera: '💧' };

const getRiskLevel = (score) => {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
};

const Top5RiskTable = () => {
  // ✅ FIX: Hook must be inside the component function
  const navigate = useNavigate(); 
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllDistricts()
      .then((data) => {
        console.log('Top5RiskTable - Districts loaded:', data.length);
        const enriched = data.map(d => ({
          id: d.id,
          name: d.name,
          score: d.score ?? 0,
          riskLevel: d.risk_level || getRiskLevel(d.score),
          primaryDisease: d.primary_disease || 'Dengue',
          change: d.score_change ?? (Math.random() > 0.5 ? 2.4 : -1.2)
        }));
        setDistricts(enriched.sort((a,b) => b.score - a.score).slice(0, 5));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Top5RiskTable - Error loading districts:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Top 5 High Risk Districts</h3>
      </div>
      
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          Loading districts...
        </div>
      ) : error ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
          Error loading data: {error}
        </div>
      ) : districts.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          No district data available. Run ML scoring first.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {districts.map(d => {
              const style = riskStyle[d.riskLevel] || riskStyle.LOW;
              return (
                <tr key={d.id} onClick={() => navigate(`/district/${d.id}`)} style={{ cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600 }}>{d.name}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ 
                      background: style.bg, 
                      color: style.color, 
                      padding: '4px 10px', 
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 12
                    }}>
                      {d.score.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>{diseaseEmoji[d.primaryDisease] || '🦠'} {d.primaryDisease}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Top5RiskTable;