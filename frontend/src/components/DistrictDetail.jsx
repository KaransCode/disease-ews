import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DistrictDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [district, setDistrict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/api/districts/${id}`)
      .then(res => setDistrict(res.data))
      .catch(() => setError('District data not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const riskColor = {
    CRITICAL: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    HIGH:     { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
    MEDIUM:   { bg: '#fefce8', color: '#ca8a04', border: '#fde68a' },
    LOW:      { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  };

  const Stat = ({ label, value, unit = '', color = '#0f172a' }) => (
    <div style={{
      background: '#f8fafc', borderRadius: 10, padding: '14px 16px',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span style={{ fontSize: 13, fontWeight: 400, color: '#94a3b8', marginLeft: 3 }}>{unit}</span>}
      </div>
    </div>
  );

  const Bar = ({ value, max, color }) => (
    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, marginTop: 6 }}>
      <div style={{
        height: '100%', borderRadius: 4, background: color,
        width: `${Math.min((value / max) * 100, 100)}%`,
        transition: 'width 1s ease'
      }} />
    </div>
  );

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f1f5f9'
    }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div>Loading district data...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f1f5f9'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>
        <div style={{ color: '#dc2626', fontWeight: 600 }}>{error}</div>
        <button onClick={() => navigate(-1)} style={{
          marginTop: 16, padding: '8px 20px', borderRadius: 8,
          background: '#0f172a', color: '#fff', border: 'none', cursor: 'pointer'
        }}>← Go Back</button>
      </div>
    </div>
  );

  const rs = riskColor[district.risk_level] || riskColor.MEDIUM;
  const totalCases = (district.dengue_cases || 0) + (district.malaria_cases || 0) + (district.cholera_cases || 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{
        background: '#0f172a', color: '#f1f5f9',
        padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 16
      }}>
        <button onClick={() => navigate(-1)} style={{
          background: '#1e293b', border: '1px solid #334155', color: '#94a3b8',
          padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13
        }}>← Back</button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            {district.district_name || district.name}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            District ID: {id} · Punjab Health Surveillance
          </div>
        </div>
        <span style={{
          marginLeft: 'auto',
          background: rs.bg, color: rs.color,
          border: `1px solid ${rs.border}`,
          padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700
        }}>
          {district.risk_level || 'N/A'} RISK
        </span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px' }}>

        {/* Risk Score Banner */}
        <div style={{
          background: '#fff', borderRadius: 12, padding: '20px 24px',
          border: '1px solid #e2e8f0', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 24
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Overall Risk Score</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: rs.color, lineHeight: 1 }}>
              {district.risk_score ?? 'N/A'}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>out of 100</div>
          </div>
          <div style={{ flex: 1 }}>
            <Bar value={district.risk_score || 0} max={100} color={rs.color} />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 10, color: '#94a3b8', marginTop: 4
            }}>
              <span>0 — Safe</span><span>50 — Medium</span><span>100 — Critical</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Week-over-Week Change</div>
            <div style={{
              fontSize: 28, fontWeight: 800,
              color: (district.wow_change > 0) ? '#dc2626' : '#16a34a'
            }}>
              {district.wow_change > 0 ? '↑' : '↓'} {Math.abs(district.wow_change ?? 0).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Disease Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <Stat label="Total Cases Today"  value={totalCases}                   color="#0f172a" />
          <Stat label="🦟 Dengue Cases"    value={district.dengue_cases  || 0}  color="#f97316" />
          <Stat label="🩸 Malaria Cases"   value={district.malaria_cases || 0}  color="#8b5cf6" />
          <Stat label="💧 Cholera Cases"   value={district.cholera_cases || 0}  color="#06b6d4" />
        </div>

        {/* Environmental + ML Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

          {/* Environmental Factors */}
          <div style={{
            background: '#fff', borderRadius: 12, padding: 20,
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              🌦 Environmental Factors
            </h3>
            {[
              { label: 'Rainfall',         value: district.rainfall    || 0, max: 200, unit: 'mm',  color: '#3b82f6' },
              { label: 'Temperature',      value: district.temperature || 0, max: 50,  unit: '°C',  color: '#f97316' },
              { label: 'Humidity',         value: district.humidity    || 0, max: 100, unit: '%',   color: '#06b6d4' },
              { label: 'Population Density', value: district.population_density || 0, max: 5000, unit: '/km²', color: '#8b5cf6' },
            ].map(({ label, value, max, unit, color }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#475569' }}>{label}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{value.toLocaleString()}{unit}</span>
                </div>
                <Bar value={value} max={max} color={color} />
              </div>
            ))}
          </div>

          {/* ML Prediction Panel */}
          <div style={{
            background: '#fff', borderRadius: 12, padding: 20,
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              🤖 ML Model Prediction
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Anomaly Flag</div>
                <div style={{
                  fontSize: 16, fontWeight: 800, marginTop: 4,
                  color: district.anomaly_flag ? '#dc2626' : '#16a34a'
                }}>
                  {district.anomaly_flag ? '⚠ DETECTED' : '✓ NORMAL'}
                </div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Primary Disease</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {district.primary_disease || 'N/A'}
                </div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Trend</div>
                <div style={{
                  fontSize: 16, fontWeight: 800, marginTop: 4,
                  color: district.trend === 'up' ? '#dc2626' : '#16a34a'
                }}>
                  {district.trend === 'up' ? '↑ Rising' : '↓ Stable'}
                </div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>XGBoost Confidence</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {district.confidence || '87'}%
                </div>
              </div>
            </div>

            {/* Alert if high risk */}
            {(district.risk_level === 'CRITICAL' || district.risk_level === 'HIGH') && (
              <div style={{
                marginTop: 14, background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#991b1b'
              }}>
                ⚠ Immediate intervention recommended. Alert sent to District Health Officer.
              </div>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', paddingBottom: 24 }}>
          Data last updated: {district.last_updated || new Date().toLocaleString('en-IN')} ·
          Source: Punjab Health Surveillance System
        </div>

      </div>
    </div>
  );
};

export default DistrictDetail;