import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllDistricts } from '../services/api';

const PUNJAB_CENTER = [31.1471, 75.3412];
const PUNJAB_ZOOM = 8;

export const getRiskColor = (score) => {
  if (score === null || score === undefined) return '#8A99B0';
  if (score >= 75) return '#D0293C';
  if (score >= 50) return '#C87000';
  return '#1A7A4A';
};

export const getRiskRadius = (score) => {
  if (score === null || score === undefined) return 10;
  if (score >= 75) return 18;
  if (score >= 50) return 14;
  return 10;
};

const Legend = () => (
  <div className="map-legend">
    <div className="legend-title">RISK LEVEL</div>
    {[
      { color: '#D0293C', label: 'HIGH (≥75)', size: 14 },
      { color: '#C87000', label: 'MODERATE (50–74)', size: 11 },
      { color: '#1A7A4A', label: 'LOW (<50)', size: 8 },
      { color: '#8A99B0', label: 'No Data', size: 8 },
    ].map(({ color, label, size }) => (
      <div key={label} className="legend-row">
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r={size} fill={color} fillOpacity={0.85} stroke={color} strokeWidth="1.5" />
        </svg>
        <span>{label}</span>
      </div>
    ))}
  </div>
);

export default function MapDashboard({ onDistrictSelect, selectedDistrict, simulatedScores }) {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllDistricts().then(data => {
      setDistricts(data);
      setLoading(false);
    });
  }, []);

  const getEffectiveScore = (d) => simulatedScores?.[d.id] ?? d.score;

  return (
    <div className="map-wrapper">
      {loading && (
        <div className="map-loading">
          <div className="spinner" />
          <span>Loading district data…</span>
        </div>
      )}
      <MapContainer
        center={PUNJAB_CENTER}
        zoom={PUNJAB_ZOOM}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {districts.map(district => {
          const score = getEffectiveScore(district);
          const color = getRiskColor(score);
          const radius = getRiskRadius(score);
          const isSelected = selectedDistrict?.id === district.id;

          return (
            <CircleMarker
              key={district.id}
              center={[district.lat, district.lng]}
              radius={isSelected ? radius + 4 : radius}
              pathOptions={{
                color: isSelected ? '#fff' : color,
                weight: isSelected ? 3 : 1.5,
                fillColor: color,
                fillOpacity: 0.85,
              }}
              eventHandlers={{
                click: () => onDistrictSelect(district),
              }}
            >
              <Popup>
                <div className="map-popup">
                  <strong>{district.name}</strong>
                  <div className="popup-score" style={{ color }}>
                    Score: {score ?? '—'}
                  </div>
                  <div className="popup-risk">{district.risk_level}</div>
                  <div className="popup-disease">🦟 {district.primary_disease}</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <Legend />
    </div>
  );
}
