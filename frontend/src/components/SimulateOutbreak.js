import React, { useState, useEffect, useRef } from 'react';

// Use Rupnagar (district_id=18) - currently the highest risk district
const HIGH_RISK_DISTRICT_ID = 18;
const HIGH_RISK_DISTRICT_NAME = 'Rupnagar';
const SCORE_START = 30;
const SCORE_END = 95;
const ANIMATION_DURATION = 3000;

export default function SimulateOutbreak({ onSimulate, onReset }) {
  const [phase, setPhase] = useState('idle'); // idle | animating | done
  const [displayScore, setDisplayScore] = useState(SCORE_START);
  const [alertVisible, setAlertVisible] = useState(false);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const animate = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
    const eased = easeInOut(progress);
    const score = Math.round(SCORE_START + (SCORE_END - SCORE_START) * eased);

    setDisplayScore(score);
    onSimulate?.({ [HIGH_RISK_DISTRICT_ID]: score });

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      setPhase('done');
      setAlertVisible(true);
    }
  };

  const handleStart = () => {
    if (phase === 'animating') return;
    setPhase('animating');
    setAlertVisible(false);
    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(animate);
  };

  const handleReset = () => {
    cancelAnimationFrame(rafRef.current);
    setPhase('idle');
    setDisplayScore(SCORE_START);
    setAlertVisible(false);
    onReset?.();
    onSimulate?.({});
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const scoreColor =
    displayScore >= 75 ? '#D0293C' :
    displayScore >= 50 ? '#C87000' : '#1A7A4A';

  return (
    <div className="simulate-wrapper">
      {/* Main button */}
      {phase === 'idle' && (
        <button className="simulate-btn" onClick={handleStart}>
          <span className="simulate-icon">⚡</span>
          Simulate Outbreak — {HIGH_RISK_DISTRICT_NAME}
        </button>
      )}

      {/* Animation phase */}
      {phase === 'animating' && (
        <div className="simulate-live">
          <div className="simulate-label">🔴 LIVE — {HIGH_RISK_DISTRICT_NAME} risk escalating</div>
          <div className="simulate-score-bar">
            <div
              className="simulate-score-fill"
              style={{
                width: `${displayScore}%`,
                background: `linear-gradient(90deg, #1A7A4A, ${scoreColor})`,
              }}
            />
          </div>
          <div className="simulate-score-num" style={{ color: scoreColor }}>
            {displayScore} <span className="simulate-score-label">/ 100</span>
          </div>
        </div>
      )}

      {/* Done phase */}
      {phase === 'done' && (
        <div className="simulate-done">
          <div className="simulate-done-score" style={{ color: scoreColor }}>
            ● {HIGH_RISK_DISTRICT_NAME}: <strong>{SCORE_END}</strong> — CRITICAL RISK
          </div>
          <button className="simulate-reset-btn" onClick={handleReset}>
            ↺ Reset
          </button>
        </div>
      )}

      {/* Alert notification */}
      {alertVisible && (
        <div className="simulate-alert-toast">
          <div className="toast-icon">📡</div>
          <div>
            <div className="toast-title">ALERT SENT to CMO {HIGH_RISK_DISTRICT_NAME}</div>
            <div className="toast-body">Dengue surge predicted — Immediate action required</div>
          </div>
        </div>
      )}
    </div>
  );
}
