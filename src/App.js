import React, { useState, createContext, useContext } from 'react';
import LoginPage   from './components/LoginPage';
import Navbar      from './components/Navbar';
import ProgressBar from './components/ProgressBar';
import StatCards   from './components/StatCards';
import TradeTable  from './components/TradeTable';
import TradeModal  from './components/TradeModal';
import { mockTrades, computeTrades, INITIAL_CAPITAL } from './data';

// ─── Theme Context ────────────────────────────────────────────────────────────
// Import useTheme in any child component to access the current theme tokens.
// Example:  const theme = useTheme();
export const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

// ─── Theme Tokens ─────────────────────────────────────────────────────────────
export const themes = {
  dark: {
    name: 'dark',
    bg:           '#060a0f',
    bgSecondary:  '#0d1117',
    bgTertiary:   'rgba(255,255,255,0.03)',
    border:       'rgba(255,255,255,0.07)',
    borderAccent: 'rgba(0,255,136,0.1)',
    text:         '#ffffff',
    textMuted:    '#888888',
    textFaint:    '#444444',
    textDim:      '#555555',
    navBg:        'rgba(6,10,15,0.95)',
    inputBg:      'rgba(255,255,255,0.04)',
    inputBorder:  'rgba(255,255,255,0.08)',
    scrollThumb:  'rgba(255,255,255,0.1)',
    selectBg:     '#0d1117',
    accent:       '#00ff88',
    accentDark:   '#00cc6a',
    accentGlow:   'rgba(0,255,136,0.4)',
    accentSubtle: 'rgba(0,255,136,0.03)',
    accentBorder: 'rgba(0,255,136,0.2)',
    accentText:   '#00ff88',
    red:          '#ff4d4d',
    redSubtle:    'rgba(255,77,77,0.08)',
    redBorder:    'rgba(255,77,77,0.2)',
    redBg:        'rgba(255,77,77,0.05)',
    green:        '#00ff88',
    greenSubtle:  'rgba(0,255,136,0.08)',
    greenBorder:  'rgba(0,255,136,0.2)',
    orange:       '#f5a623',
    purple:       '#a78bfa',
    purpleSubtle: 'rgba(167,139,250,0.1)',
    purpleBorder: 'rgba(167,139,250,0.2)',
    monoRed:      '#ff6b6b',
    progressTrack:'rgba(255,255,255,0.06)',
    thSortColor:  '#00ff88',
    thColor:      '#444444',
    trHover:      'rgba(255,255,255,0.03)',
    trBorder:     'rgba(255,255,255,0.04)',
  },
  light: {
    name: 'light',
    bg:           '#f0f4f8',
    bgSecondary:  '#ffffff',
    bgTertiary:   'rgba(0,0,0,0.02)',
    border:       'rgba(0,0,0,0.08)',
    borderAccent: 'rgba(0,160,80,0.15)',
    text:         '#0a1628',
    textMuted:    '#4a5568',
    textFaint:    '#94a3b8',
    textDim:      '#64748b',
    navBg:        'rgba(240,244,248,0.95)',
    inputBg:      'rgba(0,0,0,0.03)',
    inputBorder:  'rgba(0,0,0,0.1)',
    scrollThumb:  'rgba(0,0,0,0.15)',
    selectBg:     '#ffffff',
    accent:       '#00a651',
    accentDark:   '#007d3c',
    accentGlow:   'rgba(0,166,81,0.25)',
    accentSubtle: 'rgba(0,166,81,0.04)',
    accentBorder: 'rgba(0,166,81,0.2)',
    accentText:   '#007d3c',
    red:          '#dc2626',
    redSubtle:    'rgba(220,38,38,0.06)',
    redBorder:    'rgba(220,38,38,0.2)',
    redBg:        'rgba(220,38,38,0.04)',
    green:        '#00a651',
    greenSubtle:  'rgba(0,166,81,0.07)',
    greenBorder:  'rgba(0,166,81,0.2)',
    orange:       '#d97706',
    purple:       '#7c3aed',
    purpleSubtle: 'rgba(124,58,237,0.07)',
    purpleBorder: 'rgba(124,58,237,0.2)',
    monoRed:      '#dc2626',
    progressTrack:'rgba(0,0,0,0.07)',
    thSortColor:  '#00a651',
    thColor:      '#94a3b8',
    trHover:      'rgba(0,0,0,0.02)',
    trBorder:     'rgba(0,0,0,0.04)',
  },
};

// ─── Global Styles ────────────────────────────────────────────────────────────
const GlobalStyles = ({ theme }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${theme.bg};
      color: ${theme.text};
      font-family: 'Syne', sans-serif;
      transition: background 0.3s ease, color 0.3s ease;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${theme.scrollThumb}; border-radius: 99px; }
    input::placeholder { color: ${theme.textFaint}; }
    select option { background: ${theme.selectBg}; color: ${theme.text}; }
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .theme-toggle {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 14px; border-radius: 20px;
      border: 1px solid ${theme.border};
      background: ${theme.bgTertiary};
      color: ${theme.textMuted};
      font-size: 12px; font-weight: 600; cursor: pointer;
      font-family: 'Syne', sans-serif;
      transition: all 0.2s; white-space: nowrap;
    }
    .theme-toggle:hover { border-color: ${theme.accentBorder}; color: ${theme.accentText}; }
  `}</style>
);

// ─── Sun / Moon Icons ─────────────────────────────────────────────────────────
const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>   <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

// ─── Themed Navbar (replaces Navbar.jsx for theme-aware rendering) ────────────
// NOTE: Navbar.jsx doesn't consume ThemeContext yet. This inline version handles
// the toggle button and themed colours. You can later refactor Navbar.jsx to use
// useTheme() and remove this component.
function ThemedNavbar({ user, onLogout, theme, onToggleTheme }) {
  const iconColor = theme.name === 'dark' ? '#060a0f' : '#ffffff';
  return (
    <nav style={{
      borderBottom: `1px solid ${theme.border}`,
      padding: '0 32px', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 50,
      background: theme.navBg, backdropFilter: 'blur(12px)',
      fontFamily: "'Syne', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 16px ${theme.accentGlow}`,
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="16 7 22 7 22 13"               stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px', color: theme.text }}>50 TO A BILLION</div>
          <div style={{ fontSize: 9, color: theme.accentText, letterSpacing: 2, marginTop: -1 }}>TRADE JOURNAL</div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* ── Theme Toggle ── */}
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme.name === 'dark' ? <><SunIcon /> Light</> : <><MoonIcon /> Dark</>}
        </button>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{user.name}</div>
          <div style={{ fontSize: 11, color: theme.textDim }}>{user.email}</div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: iconColor,
        }}>{user.avatar}</div>
        <button onClick={onLogout} style={{
          padding: '7px 16px', borderRadius: 8,
          border: `1px solid ${theme.border}`,
          background: 'transparent', color: theme.textMuted,
          fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
        }}>Logout</button>
      </div>
    </nav>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]           = useState(null);
  const [rawTrades, setRawTrades] = useState(mockTrades);
  const [modal, setModal]         = useState(null); // null | 'new' | trade object
  const [themeName, setThemeName] = useState('dark');

  const theme       = themes[themeName];
  const toggleTheme = () => setThemeName(n => n === 'dark' ? 'light' : 'dark');

  // ── Auth ────────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <ThemeContext.Provider value={theme}>
        <GlobalStyles theme={theme} />
        <LoginPage onLogin={setUser} />
      </ThemeContext.Provider>
    );
  }

  // ── Compute derived trade data ───────────────────────────────────────────────
  const trades = computeTrades(rawTrades);
  const closedTrades   = trades.filter(t => t.status === 'closed');
  const currentCapital = closedTrades.length
    ? closedTrades[closedTrades.length - 1].capitalAfter
    : INITIAL_CAPITAL;

  // ── Trade CRUD ───────────────────────────────────────────────────────────────
  const handleSave = (form) => {
    if (modal === 'new') {
      setRawTrades(prev => [...prev, { ...form, id: Date.now() }]);
    } else {
      setRawTrades(prev => prev.map(t => t.id === modal.id ? { ...form, id: t.id } : t));
    }
    setModal(null);
  };

  const handleDelete = (id) => setRawTrades(prev => prev.filter(t => t.id !== id));
  const handleEdit   = (trade) => setModal(trade === null ? 'new' : trade);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <ThemeContext.Provider value={theme}>
      <GlobalStyles theme={theme} />
      <div style={{ minHeight: '100vh', background: theme.bg, transition: 'background 0.3s ease' }}>

        <ThemedNavbar
          user={user}
          onLogout={() => setUser(null)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px' }}>
          <ProgressBar currentCapital={currentCapital} />
          <StatCards trades={trades} currentCapital={currentCapital} />
          <TradeTable
            trades={trades}
            rawTrades={rawTrades}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </main>
      </div>

      {/* Modal — shown when adding or editing a trade */}
      {modal !== null && (
        <TradeModal
          trade={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </ThemeContext.Provider>
  );
}