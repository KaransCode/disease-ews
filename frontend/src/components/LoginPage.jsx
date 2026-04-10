import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState('login');   // 'login' | 'register'
  const [role, setRole] = useState('user');    // 'user' | 'admin'
  const [form, setForm] = useState({ name: '', email: '', password: '', district: '', adminCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ADMIN_SECRET = 'CODEVISTA2024';  // Replace with env var in production

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'register' && role === 'admin' && form.adminCode !== ADMIN_SECRET) {
      setError('Invalid admin authorization code.');
      setLoading(false);
      return;
    }

    // Simulate API call — replace with your Flask /api/login or /api/register
    setTimeout(() => {
      setLoading(false);
      onLogin({ email: form.email, role, name: form.name || form.email.split('@')[0] });
    }, 800);
  };

  const inp = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #cbd5e1', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', background: '#fff', color: '#0f172a'
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Background grid decoration */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div style={{
        background: '#fff', borderRadius: 16, padding: '36px 40px',
        width: '100%', maxWidth: 420, position: 'relative', zIndex: 1,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 12px',
            background: 'linear-gradient(135deg,#ef4444,#f97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28
          }}>🦠</div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            Disease Outbreak EWS
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Punjab Health Surveillance · CODEVISTA v1.0
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'flex', background: '#f1f5f9', borderRadius: 10,
          padding: 4, marginBottom: 20, gap: 4
        }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: mode === m ? '#0f172a' : 'transparent',
              color: mode === m ? '#fff' : '#64748b',
              transition: 'all 0.2s'
            }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Role selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[['user', '👤 Health Worker'], ['admin', '🔐 Authority / Admin']].map(([r, label]) => (
            <button key={r} onClick={() => setRole(r)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer',
              fontSize: 12, fontWeight: 500,
              border: role === r ? '2px solid #0f172a' : '1px solid #cbd5e1',
              background: role === r ? '#f0f9ff' : '#fff',
              color: role === r ? '#0f172a' : '#64748b'
            }}>{label}</button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && (
            <input name="name" placeholder="Full Name" value={form.name}
              onChange={handle} required style={inp} />
          )}
          <input name="email" type="email" placeholder="Email Address" value={form.email}
            onChange={handle} required style={inp} />
          <input name="password" type="password" placeholder="Password" value={form.password}
            onChange={handle} required style={inp} />
          {mode === 'register' && (
            <select name="district" value={form.district} onChange={handle} required style={inp}>
              <option value="">-- Select District --</option>
              {['Ludhiana','Amritsar','Jalandhar','Patiala','Bathinda',
                'Mohali','Gurdaspur','Hoshiarpur','Moga','Firozpur'].map(d =>
                <option key={d} value={d}>{d}</option>
              )}
            </select>
          )}
          {mode === 'register' && role === 'admin' && (
            <input name="adminCode" type="password" placeholder="Admin Authorization Code"
              value={form.adminCode} onChange={handle} required style={inp} />
          )}

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '11px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: loading ? '#94a3b8' : '#0f172a',
            color: '#fff', fontSize: 14, fontWeight: 700, marginTop: 4
          }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 20, marginBottom: 0 }}>
          Authorized personnel only · Data is sensitive
        </p>
      </div>
    </div>
  );
};

export default LoginPage;