import React, { useEffect, useState } from 'react';
import { getAllDistricts } from '../services/api';
import api from '../services/api';

const Meter = ({ value, color }) => (
  <div style={{ marginTop: 4 }}>
    <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3 }}>
      <div style={{
        height: '100%', borderRadius: 3, background: color,
        width: `${Math.min(value, 100)}%`, transition: 'width 0.8s ease'
      }} />
    </div>
  </div>
);

const DistrictComparison = () => {
  const [allDistricts, setAllDistricts] = useState([]);
  const [districtStats, setDistrictStats] = useState({});
  const [selected, setSelected] = useState(['', '']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllDistricts()
      .then((data) => {
        console.log('DistrictComparison - Districts loaded:', data.length);
        setAllDistricts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('DistrictComparison - Error loading districts:', err);
        setLoading(false);
      });
  }, []);

  const fetchDistrictStats = async (districtId) => {
    if (districtStats[districtId]) return;
    
    try {
      const response = await api.get(`/districts/${districtId}/stats`);
      if (response.data.stats && response.data.stats.length > 0) {
        const latestStats = response.data.stats[0];
        setDistrictStats(prev => ({
          ...prev,
          [districtId]: latestStats
        }));
        console.log(`District: ${latestStats.district_name || districtId}, Stats:`, latestStats);
      }
    } catch (err) {
      console.error(`Error fetching stats for district ${districtId}:`, err);
    }
  };

  const getDistrict = (name) => allDistricts.find(d => d.name === name);

  const setSelection = (idx, val) => {
    const updated = [...selected];
    updated[idx] = val;
    setSelected(updated);
    
    if (val) {
      const district = getDistrict(val);
      if (district) {
        fetchDistrictStats(district.id);
      }
    }
  };

  const d1 = getDistrict(selected[0]);
  const d2 = getDistrict(selected[1]);

  const getMetrics = (district) => {
    if (!district) return [];
    
    const stats = districtStats[district.id] || {};
    
    console.log(`District: ${district.name}, Stats:`, stats);
    
    return [
      { label: 'Risk Score',    value: Math.round((district.score ?? 0) * 100) / 100, max: 100, unit: '', color: '#ef4444' },
      { label: 'Dengue Cases',  value: stats.dengue_cases ?? 0,    max: 500, unit: '', color: '#f97316' },
      { label: 'Malaria Cases', value: stats.malaria_cases ?? 0,   max: 500, unit: '', color: '#8b5cf6' },
      { label: 'Cholera Cases', value: stats.cholera_cases ?? 0,   max: 500, unit: '', color: '#06b6d4' },
      { label: 'OPD Cases',     value: stats.opd_cases ?? 0,       max: 1000, unit: '', color: '#10b981' },
      { label: 'Rainfall (mm)', value: stats.rainfall_mm ?? 0,     max: 200, unit: 'mm', color: '#3b82f6' },
      { label: 'Temperature',   value: stats.temp_max_c ?? 0,      max: 50, unit: '°C', color: '#f59e0b' },
      { label: 'Hospital Load', value: stats.hospital_load ?? 0,   max: 1, unit: '', color: '#06b6d4', isPercentage: true },
    ];
  };

  const riskColor = { CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#ca8a04', LOW: '#16a34a' };

  const DistrictCard = ({ districtData, selectorIdx }) => (
    <div style={{
      flex: 1, background: '#f8fafc', borderRadius: 12,
      border: '1px solid #e2e8f0', padding: 16
    }}>
      <select
        value={selected[selectorIdx]}
        onChange={e => setSelection(selectorIdx, e.target.value)}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: 8,
          border: '1px solid #cbd5e1', fontSize: 13, marginBottom: 14,
          background: '#fff', color: '#0f172a', outline: 'none'
        }}
      >
        <option value="">-- Select District --</option>
        {allDistricts.map(d => {
          return <option key={d.name} value={d.name}>{d.name}</option>;
        })}
      </select>

      {districtData ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              {districtData.name}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: (riskColor[districtData.risk_level] || '#94a3b8') + '22',
              color: riskColor[districtData.risk_level] || '#64748b'
            }}>{districtData.risk_level || 'N/A'}</span>
          </div>
          {getMetrics(districtData).map(({ label, value, max, unit, color, isPercentage }) => {
            const displayValue = isPercentage ? (value * 100).toFixed(0) + '%' : 
                                typeof value === 'number' ? value.toLocaleString() : value;
            const meterValue = isPercentage ? value * 100 : (value / max) * 100;
            
            return (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    {displayValue}{unit}
                  </span>
                </div>
                <Meter value={Math.min(meterValue, 100)} color={color} />
              </div>
            );
          })}
        </>
      ) : (
        <div style={{
          textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13
        }}>
          Select a district to compare
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: 12, padding: 20, margin: '16px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>⚖️</span>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
          District Comparison
        </h3>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          Loading districts...
        </div>
      ) : allDistricts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          No district data available. Run ML scoring first.
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 16 }}>
          <DistrictCard districtData={d1} selectorIdx={0} />
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#cbd5e1', flexShrink: 0
          }}>vs</div>
          <DistrictCard districtData={d2} selectorIdx={1} />
        </div>
      )}
    </div>
  );
};

export default DistrictComparison;