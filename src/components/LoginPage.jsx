import React, { useState } from 'react';
import { useTheme } from '../App';

export default function LoginPage({ onLogin }) {
  const theme = useTheme();
  const isDark = theme.name === 'dark';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://7rh718sms4.execute-api.us-east-1.amazonaws.com/api'}/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid username or password.');
        return;
      }
      // data = { role: 'admin' | 'viewer', name: '...' }
      onLogin({ name: data.name, role: data.role, avatar: data.name.slice(0, 2).toUpperCase() });
    } catch (err) {
      setError('Cannot reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 10, color: theme.text,
    fontSize: 14, fontFamily: "'Syne', sans-serif",
    outline: 'none', boxSizing: 'border-box',
    marginTop: 6,
  };

  return (
    <div style={{
      minHeight: '100vh', background: theme.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Syne', sans-serif", position: 'relative', overflow: 'hidden',
      transition: 'background 0.3s ease',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${isDark ? 'rgba(0,255,136,0.03)' : 'rgba(0,166,81,0.04)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(0,255,136,0.03)' : 'rgba(0,166,81,0.04)'} 1px, transparent 1px)`,
        backgroundSize: '40px 40px', pointerEvents: 'none',
      }} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle, ${isDark ? 'rgba(0,255,136,0.04)' : 'rgba(0,166,81,0.06)'} 0%, transparent 70%)`,
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420, width: '90%' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 40 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 30px ${theme.accentGlow}`,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke={isDark ? '#060a0f' : '#fff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16 7 22 7 22 13"               stroke={isDark ? '#060a0f' : '#fff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: '-0.5px', lineHeight: 1 }}>50 TO A BILLION</div>
            <div style={{ fontSize: 11, color: theme.accentText, letterSpacing: 3, marginTop: 3 }}>TRADE JOURNAL</div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
          borderRadius: 20, padding: '40px 36px',
          boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: theme.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 13, color: theme.textMuted, margin: '0 0 28px' }}>
            Sign in to access the trade journal
          </p>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 20,
              background: theme.redSubtle, border: `1px solid ${theme.redBorder}`,
              fontSize: 13, color: theme.red, textAlign: 'left',
            }}>
              {error}
            </div>
          )}

          {/* Username */}
          <div style={{ textAlign: 'left', marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: theme.textMuted, letterSpacing: 1.5, fontWeight: 600 }}>
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Enter username"
              style={inputStyle}
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div style={{ textAlign: 'left', marginBottom: 28 }}>
            <label style={{ fontSize: 11, color: theme.textMuted, letterSpacing: 1.5, fontWeight: 600 }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Enter password"
              style={inputStyle}
              autoComplete="current-password"
            />
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
              color: isDark ? '#060a0f' : '#ffffff',
              fontSize: 15, fontWeight: 800, cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit', letterSpacing: 0.3,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: loading ? 0.8 : 1,
              boxShadow: `0 0 24px ${theme.accentGlow}`,
            }}
          >
            {loading
              ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'}`, borderTopColor: isDark ? '#060a0f' : '#fff', animation: 'spin 0.8s linear infinite' }} /> Signing in...</>
              : 'Sign In'
            }
          </button>
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: theme.textFaint }}>
          50 Trades to a Billion · Private Journal
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}