import React, { useState, useEffect } from 'react';
import { getAlerts } from '../services/api';

const REFRESH_INTERVAL = 30000;

export default function AlertBanner({ extraAlerts = [] }) {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = async () => {
    try {
      const data = await getAlerts();
      const high = data.filter(a => a.risk_level === 'HIGH' || a.risk_score >= 60);
      setAlerts(high);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const allAlerts = [...extraAlerts, ...alerts];
  if (allAlerts.length === 0) return null;

  const ticker = allAlerts
    .map(a => `⚠ ${a.district_name}: Score ${a.risk_score} — ${a.risk_level} RISK — ${a.message || a.primary_disease + ' surge predicted'}`)
    .join('     •     ');

  return (
    <div className="alert-banner" role="alert" aria-live="polite">
      <div className="alert-badge">🚨 LIVE ALERTS</div>
      <div className="alert-ticker-wrapper">
        <div className="alert-ticker" style={{ '--ticker-text': `"${ticker}"` }}>
          <span>{ticker}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ticker}</span>
        </div>
      </div>
    </div>
  );
}
