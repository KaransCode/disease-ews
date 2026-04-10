import React, { useState, useEffect, useCallback } from 'react';
import { getSummary } from '../services/api';

const REFRESH_INTERVAL = 60000;

const Skeleton = () => (
  <div className="stat-card">
    <div className="skeleton skeleton-icon" />
    <div className="skeleton skeleton-num" />
    <div className="skeleton skeleton-label" />
  </div>
);

export default function StatCards() {
  const [summary, setSummary] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await getSummary();
      setSummary(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchSummary]);

  const minsAgo = lastUpdated
    ? Math.floor((Date.now() - lastUpdated) / 60000)
    : null;

  const cards = summary ? [
    {
      icon: '🗺️',
      value: summary.districts_monitored,
      label: 'Districts Monitored',
      accent: '#0094B3',
      bg: 'linear-gradient(135deg, #0094B3 0%, #006f87 100%)',
      textColor: '#fff',
    },
    {
      icon: '🔴',
      value: summary.high_risk_count,
      label: 'High Risk Zones',
      accent: summary.high_risk_count > 0 ? '#D0293C' : '#1A7A4A',
      bg: summary.high_risk_count > 0
        ? 'linear-gradient(135deg, #D0293C 0%, #a01e2c 100%)'
        : 'linear-gradient(135deg, #1A7A4A 0%, #125436 100%)',
      textColor: '#fff',
      pulse: summary.high_risk_count > 0,
    },
    {
      icon: '📢',
      value: summary.alerts_sent_today,
      label: 'Alerts Sent Today',
      accent: '#C87000',
      bg: 'linear-gradient(135deg, #C87000 0%, #9a5700 100%)',
      textColor: '#fff',
    },
  ] : [];

  return (
    <div className="stat-cards-wrapper">
      <div className="stat-cards-row">
        {loading
          ? [0, 1, 2].map(i => <Skeleton key={i} />)
          : cards.map((card, i) => (
            <div
              key={i}
              className={`stat-card${card.pulse ? ' pulse' : ''}`}
              style={{ background: card.bg }}
            >
              <div className="stat-card-icon">{card.icon}</div>
              <div className="stat-card-value" style={{ color: card.textColor }}>
                {card.value}
              </div>
              <div className="stat-card-label" style={{ color: card.textColor }}>
                {card.label}
              </div>
            </div>
          ))
        }
      </div>
      {lastUpdated && (
        <p className="last-updated">
          ⏱ Last updated: {minsAgo === 0 ? 'just now' : `${minsAgo} min${minsAgo !== 1 ? 's' : ''} ago`}
        </p>
      )}
    </div>
  );
}
