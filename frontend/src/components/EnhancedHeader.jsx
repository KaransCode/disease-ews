import React, { useState, useEffect } from 'react';

const EnhancedHeader = ({ alertCount = 0 }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (d) =>
    d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (d) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header style={{
      background: '#0f172a',
      color: '#f1f5f9',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #1e293b'
    }}>
      {/* Left: Logo + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 8,
          background: 'linear-gradient(135deg, #ef4444, #f97316)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 16, color: '#fff'
        }}>🦠</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>
            Disease Outbreak Early Warning System
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            Punjab Health Surveillance · CODEVISTA v1.0
          </div>
        </div>
      </div>

      {/* Center: LIVE badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#dc2626', color: '#fff',
          padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: '#fff',
            animation: 'pulse 1.4s infinite'
          }} />
          LIVE
        </span>
        {alertCount > 0 && (
          <span style={{
            background: '#f97316', color: '#fff',
            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
          }}>
            {alertCount} Alert{alertCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Right: Clock */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1, fontFamily: 'monospace' }}>
          {formatTime(time)}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(time)}</div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </header>
  );
};

export default EnhancedHeader;