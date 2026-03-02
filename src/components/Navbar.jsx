import React from 'react';

export default function Navbar({ user, onLogout }) {
  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <div style={styles.logoRow}>
        <div style={styles.logoBox}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="#060a0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="16 7 22 7 22 13" stroke="#060a0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div style={styles.logoTitle}>50 Trades TO A BILLION</div>
          <div style={styles.logoSub}>TRADE JOURNAL</div>
        </div>
      </div>

      {/* User + Logout */}
      <div style={styles.userRow}>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user.name}</div>
          <div style={styles.userEmail}>{user.email}</div>
        </div>
        <div style={styles.avatar}>{user.avatar}</div>
        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '0 32px',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: 'rgba(6,10,15,0.95)',
    backdropFilter: 'blur(12px)',
    fontFamily: "'Syne', sans-serif",
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 12 },
  logoBox: {
    width: 32, height: 32,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 16px rgba(0,255,136,0.3)',
  },
  logoTitle: { fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px', color: '#fff' },
  logoSub:   { fontSize: 9, color: '#00ff88', letterSpacing: 2, marginTop: -1 },
  userRow:   { display: 'flex', alignItems: 'center', gap: 16 },
  userInfo:  { textAlign: 'right' },
  userName:  { fontSize: 13, fontWeight: 700, color: '#fff' },
  userEmail: { fontSize: 11, color: '#555' },
  avatar: {
    width: 36, height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 800, color: '#060a0f',
  },
  logoutBtn: {
    padding: '7px 16px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: '#666', fontSize: 12,
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
  },
};
