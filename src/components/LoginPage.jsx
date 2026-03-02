import React, { useState } from 'react';
import { useTheme } from '../App';

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" style={{ flexShrink: 0 }}>
      <rect x="1"  y="1"  width="9" height="9" fill="#f25022"/>
      <rect x="11" y="1"  width="9" height="9" fill="#7fba00"/>
      <rect x="1"  y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
    </svg>
  );
}

export default function LoginPage({ onLogin }) {
  const theme   = useTheme();
  const [loading, setLoading] = useState(false);

  const isDark = theme.name === 'dark';

  const handleLogin = () => {
    setLoading(true);
    // ── MOCK: Replace with MSAL loginPopup / loginRedirect ──────────────────
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: 'Arjun Sharma', email: 'arjun@trading.io', avatar: 'AS' });
    }, 1800);
    // ── END MOCK ─────────────────────────────────────────────────────────────
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,                 // ← was hardcoded #060a0f
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Syne', sans-serif",
      position: 'relative', overflow: 'hidden',
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

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 460, width: '90%' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 48 }}>
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
            <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: '-0.5px', lineHeight: 1 }}>
              50 TO A BILLION
            </div>
            <div style={{ fontSize: 11, color: theme.accentText, letterSpacing: 3, marginTop: 3 }}>
              TRADE JOURNAL
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: theme.bgSecondary,    // ← was hardcoded rgba(255,255,255,0.03)
          border: `1px solid ${theme.border}`,
          borderRadius: 20, padding: '44px 40px',
          backdropFilter: 'blur(20px)',
          boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 14, color: theme.textMuted, margin: '0 0 36px', lineHeight: 1.6 }}>
            Sign in with your Azure Active Directory account to access your trading journal.
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '16px 24px', borderRadius: 12,
              border: '1px solid rgba(0,120,212,0.4)',
              background: 'rgba(0,120,212,0.12)',
              color: theme.text,            // ← was hardcoded #fff
              fontSize: 15, fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              fontFamily: 'inherit', letterSpacing: 0.3,
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: '2px solid rgba(0,120,212,0.3)',
                  borderTopColor: '#0078d4',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Authenticating...
              </>
            ) : (
              <><MicrosoftIcon />Continue with Microsoft Azure AD</>
            )}
          </button>

          <div style={{
            marginTop: 28, padding: '14px 16px',
            background: theme.accentSubtle,
            border: `1px solid ${theme.accentBorder}`,
            borderRadius: 10, textAlign: 'left',
          }}>
            <div style={{ fontSize: 11, color: theme.accentText, letterSpacing: 1, marginBottom: 4 }}>DEMO MODE</div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>
              Azure AD is mocked. See <code style={{ color: theme.textMuted }}>src/authConfig.js</code> to connect your real tenant.
            </div>
          </div>
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: theme.textFaint }}>
          Secured by Microsoft Azure Active Directory · AWS RDS Powered
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}