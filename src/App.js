import React, { useState, useEffect, createContext, useContext } from 'react';
import LoginPage   from './components/LoginPage';
import ProgressBar from './components/ProgressBar';
import StatCards   from './components/StatCards';
import TradeTable  from './components/TradeTable';
import TradeModal  from './components/TradeModal';
import { computeTrades, INITIAL_CAPITAL } from './data';
import { tradesApi } from './api';

// ─── Theme Context ────────────────────────────────────────────────────────────
export const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

// ─── Theme Tokens ─────────────────────────────────────────────────────────────
export const themes = {
  dark: {
    name: 'dark',
    bg: '#060a0f', bgSecondary: '#0d1117', bgTertiary: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.07)', borderAccent: 'rgba(0,255,136,0.1)',
    text: '#ffffff', textMuted: '#888888', textFaint: '#444444', textDim: '#555555',
    navBg: 'rgba(6,10,15,0.95)', inputBg: 'rgba(255,255,255,0.04)', inputBorder: 'rgba(255,255,255,0.08)',
    scrollThumb: 'rgba(255,255,255,0.1)', selectBg: '#0d1117',
    accent: '#00ff88', accentDark: '#00cc6a', accentGlow: 'rgba(0,255,136,0.4)',
    accentSubtle: 'rgba(0,255,136,0.03)', accentBorder: 'rgba(0,255,136,0.2)', accentText: '#00ff88',
    red: '#ff4d4d', redSubtle: 'rgba(255,77,77,0.08)', redBorder: 'rgba(255,77,77,0.2)', redBg: 'rgba(255,77,77,0.05)',
    green: '#00ff88', greenSubtle: 'rgba(0,255,136,0.08)', greenBorder: 'rgba(0,255,136,0.2)',
    orange: '#f5a623', purple: '#a78bfa', purpleSubtle: 'rgba(167,139,250,0.1)', purpleBorder: 'rgba(167,139,250,0.2)',
    monoRed: '#ff6b6b', progressTrack: 'rgba(255,255,255,0.06)',
    thSortColor: '#00ff88', thColor: '#444444', trHover: 'rgba(255,255,255,0.03)', trBorder: 'rgba(255,255,255,0.04)',
  },
  light: {
    name: 'light',
    bg: '#f0f4f8', bgSecondary: '#ffffff', bgTertiary: 'rgba(0,0,0,0.02)',
    border: 'rgba(0,0,0,0.08)', borderAccent: 'rgba(0,160,80,0.15)',
    text: '#0a1628', textMuted: '#4a5568', textFaint: '#94a3b8', textDim: '#64748b',
    navBg: 'rgba(240,244,248,0.95)', inputBg: 'rgba(0,0,0,0.03)', inputBorder: 'rgba(0,0,0,0.1)',
    scrollThumb: 'rgba(0,0,0,0.15)', selectBg: '#ffffff',
    accent: '#00a651', accentDark: '#007d3c', accentGlow: 'rgba(0,166,81,0.25)',
    accentSubtle: 'rgba(0,166,81,0.04)', accentBorder: 'rgba(0,166,81,0.2)', accentText: '#007d3c',
    red: '#dc2626', redSubtle: 'rgba(220,38,38,0.06)', redBorder: 'rgba(220,38,38,0.2)', redBg: 'rgba(220,38,38,0.04)',
    green: '#00a651', greenSubtle: 'rgba(0,166,81,0.07)', greenBorder: 'rgba(0,166,81,0.2)',
    orange: '#d97706', purple: '#7c3aed', purpleSubtle: 'rgba(124,58,237,0.07)', purpleBorder: 'rgba(124,58,237,0.2)',
    monoRed: '#dc2626', progressTrack: 'rgba(0,0,0,0.07)',
    thSortColor: '#00a651', thColor: '#94a3b8', trHover: 'rgba(0,0,0,0.02)', trBorder: 'rgba(0,0,0,0.04)',
  },
};

// ─── Global Styles ────────────────────────────────────────────────────────────
const GlobalStyles = ({ theme }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${theme.bg}; color: ${theme.text}; font-family: 'Syne', sans-serif; transition: background 0.3s ease, color 0.3s ease; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${theme.scrollThumb}; border-radius: 99px; }
    input::placeholder { color: ${theme.textFaint}; }
    select option { background: ${theme.selectBg}; color: ${theme.text}; }
    input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .theme-toggle { display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; border: 1px solid ${theme.border}; background: ${theme.bgTertiary}; color: ${theme.textMuted}; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Syne', sans-serif; transition: all 0.2s; white-space: nowrap; }
    .theme-toggle:hover { border-color: ${theme.accentBorder}; color: ${theme.accentText}; }
  `}</style>
);

// ─── Icons ────────────────────────────────────────────────────────────────────
const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

// ─── Loading Screen ───────────────────────────────────────────────────────────
function LoadingScreen({ theme }) {
  return (
    <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${theme.border}`, borderTopColor: theme.accent, animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 13, color: theme.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>LOADING TRADES...</div>
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, theme, onRetry }) {
  return (
    <div style={{ margin: '0 0 20px', padding: '14px 18px', background: theme.redSubtle, border: `1px solid ${theme.redBorder}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.red, letterSpacing: 1, marginBottom: 2 }}>API ERROR</div>
        <div style={{ fontSize: 13, color: theme.textMuted }}>{message}</div>
      </div>
      <button onClick={onRetry} style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${theme.redBorder}`, background: 'transparent', color: theme.red, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Retry</button>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function ThemedNavbar({ user, onLogout, theme, onToggleTheme }) {
  const iconColor = theme.name === 'dark' ? '#060a0f' : '#ffffff';
  return (
    <nav style={{ borderBottom: `1px solid ${theme.border}`, padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, background: theme.navBg, backdropFilter: 'blur(12px)', fontFamily: "'Syne', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 16px ${theme.accentGlow}` }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="16 7 22 7 22 13" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px', color: theme.text }}>50 TO A BILLION</div>
          <div style={{ fontSize: 9, color: theme.accentText, letterSpacing: 2, marginTop: -1 }}>TRADE JOURNAL</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme.name === 'dark' ? <><SunIcon /> Light</> : <><MoonIcon /> Dark</>}
        </button>
        {/* Role badge */}
        <span style={{
          padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 1,
          background: user.role === 'admin' ? theme.accentSubtle : theme.purpleSubtle,
          border: `1px solid ${user.role === 'admin' ? theme.accentBorder : theme.purpleBorder}`,
          color: user.role === 'admin' ? theme.accentText : theme.purple,
        }}>
          {user.role === 'admin' ? 'ADMIN' : 'VIEWER'}
        </span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{user.name}</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: iconColor }}>
          {user.avatar}
        </div>
        <button onClick={onLogout} style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Logout</button>
      </div>
    </nav>
  );
}

// ─── Normalize RDS snake_case → camelCase ─────────────────────────────────────
function normalizeFromApi(t) {
  return {
    id:         t.id,
    stockName:  t.stock_name,
    symbol:     t.symbol,
    entryDate:  t.entry_date,
    entryPrice: parseFloat(t.entry_price),
    stopLoss:   parseFloat(t.stop_loss),
    exitPrice:  t.exit_price != null ? parseFloat(t.exit_price) : null,
    status:     t.status,
  };
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]           = useState(null);
  const [rawTrades, setRawTrades] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [modal, setModal]         = useState(null);
  const [themeName, setThemeName] = useState('dark');

  const theme       = themes[themeName];
  const toggleTheme = () => setThemeName(n => n === 'dark' ? 'light' : 'dark');

  // isAdmin drives all permission checks in child components
  const isAdmin = user?.role === 'admin';

  const fetchTrades = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tradesApi.getAll();
      setRawTrades(data.map(normalizeFromApi));
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to connect to API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchTrades(); }, [user]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <ThemeContext.Provider value={theme}>
        <GlobalStyles theme={theme} />
        <LoginPage onLogin={setUser} />
      </ThemeContext.Provider>
    );
  }

  if (loading) {
    return (
      <ThemeContext.Provider value={theme}>
        <GlobalStyles theme={theme} />
        <LoadingScreen theme={theme} />
      </ThemeContext.Provider>
    );
  }

  const trades         = computeTrades(rawTrades);
  const closedTrades   = trades.filter(t => t.status === 'closed');
  const currentCapital = closedTrades.length
    ? closedTrades[closedTrades.length - 1].capitalAfter
    : INITIAL_CAPITAL;

  // ── CRUD — admin only ─────────────────────────────────────────────────────
  const handleSave = async (form) => {
    if (!isAdmin) return;
    setError(null);
    try {
      if (modal === 'new') {
        const created = await tradesApi.create(form);
        setRawTrades(prev => [...prev, normalizeFromApi(created)]);
      } else {
        const updated = await tradesApi.update(modal.id, form);
        setRawTrades(prev => prev.map(t => t.id === modal.id ? normalizeFromApi(updated) : t));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save trade.');
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    setError(null);
    try {
      await tradesApi.delete(id);
      setRawTrades(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete trade.');
    }
  };

  const handleEdit = (trade) => {
    if (!isAdmin) return;
    setModal(trade === null ? 'new' : trade);
  };

  return (
    <ThemeContext.Provider value={theme}>
      <GlobalStyles theme={theme} />
      <div style={{ minHeight: '100vh', background: theme.bg, transition: 'background 0.3s ease' }}>
        <ThemedNavbar
          user={user}
          onLogout={() => { setUser(null); setRawTrades([]); }}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px' }}>
          {error && <ErrorBanner message={error} theme={theme} onRetry={fetchTrades} />}
          <ProgressBar currentCapital={currentCapital} />
          <StatCards trades={trades} currentCapital={currentCapital} />
          <TradeTable
            trades={trades}
            rawTrades={rawTrades}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />
        </main>
      </div>

      {isAdmin && modal !== null && (
        <TradeModal
          trade={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </ThemeContext.Provider>
  );
}