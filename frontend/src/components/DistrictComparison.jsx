import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
  const [selected, setSelected] = useState(['', '']);

  useEffect(() => {
    axios.get('/api/districts')
      .then(({ data }) => setAllDistricts(data))
      .catch(console.error);
  }, []);

  const getDistrict = (name) => allDistricts.find(d =>
    (d.district_name || d.name) === name
  );

  const setSelection = (idx, val) => {
    const updated = [...selected];
    updated[idx] = val;
    setSelected(updated);
  };

  const d1 = getDistrict(selected[0]);
  const d2 = getDistrict(selected[1]);

  const metrics = d => d ? [
    { label: 'Risk Score',    value: d.risk_score ?? 0,        max: 100, unit: '', color: '#ef4444' },
    { label: 'Dengue Cases',  value: d.dengue_cases ?? 0,      max: 500, unit: '', color: '#f97316' },
    { label: 'Malaria Cases', value: d.malaria_cases ?? 0,     max: 500, unit: '', color: '#8b5cf6' },
    { label: 'Cholera Cases', value: d.cholera_cases ?? 0,     max: 500, unit: '', color: '#06b6d4' },
    { label: 'WoW Change',    value: d.wow_change ?? 0,        max: 100, unit: '%', color: '#eab308' },
    { label: 'Rainfall (mm)', value: d.rainfall ?? 0,          max: 200, unit: 'mm', color: '#3b82f6' },
  ] : [];

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
          const name = d.district_name || d.name;
          return <option key={name} value={name}>{name}</option>;
        })}
      </select>

      {districtData ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              {districtData.district_name || districtData.name}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: (riskColor[districtData.risk_level] || '#94a3b8') + '22',
              color: riskColor[districtData.risk_level] || '#64748b'
            }}>{districtData.risk_level || 'N/A'}</span>
          </div>
          {metrics(districtData).map(({ label, value, max, unit, color }) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>
                  {typeof value === 'number' ? value.toLocaleString() : value}{unit}
                </span>
              </div>
              <Meter value={(value / max) * 100} color={color} />
            </div>
          ))}
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
      <div style={{ display: 'flex', gap: 16 }}>
        <DistrictCard districtData={d1} selectorIdx={0} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, color: '#cbd5e1', flexShrink: 0
        }}>vs</div>
        <DistrictCard districtData={d2} selectorIdx={1} />
      </div>
    </div>
  );
};

export default DistrictComparison;