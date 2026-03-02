import React from 'react';
import { fmt, INITIAL_CAPITAL, MAX_TRADES } from '../data';
import { useTheme } from '../App';

function StatCard({ label, value, sub, color, glow = false }) {
  const theme = useTheme();
  return (
    <div style={{
      background: theme.bgSecondary,
      border: `1px solid ${glow ? theme.accentBorder : theme.border}`,
      borderRadius: 14,
      padding: '18px 20px',
      flex: 1,
      minWidth: 140,
      boxShadow: theme.name === 'light' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
    }}>
      <div style={{ fontSize: 10, color: theme.textMuted, letterSpacing: 2, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{
        fontSize: 22, fontWeight: 800,
        color: color || theme.text,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: -0.5, lineHeight: 1,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 6 }}>{sub}</div>
      )}
    </div>
  );
}

export default function StatCards({ trades, currentCapital }) {
  const theme   = useTheme();
  const closed   = trades.filter(t => t.status === 'closed');
  const totalNet = closed.reduce((a, t) => a + t.netPnL, 0);
  const totalTax = closed.reduce((a, t) => a + t.tax, 0);
  const winners  = closed.filter(t => t.netPnL > 0).length;
  const winRate  = closed.length ? ((winners / closed.length) * 100).toFixed(0) : 0;
  const multi    = (currentCapital / INITIAL_CAPITAL).toFixed(2);

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
      <StatCard
        label="CURRENT CAPITAL"
        value={fmt(currentCapital)}
        sub={`Started with ${fmt(INITIAL_CAPITAL)}`}
        glow
      />
      <StatCard
        label="TOTAL NET P&L"
        value={fmt(totalNet)}
        sub="After taxes"
        color={totalNet >= 0 ? theme.green : theme.red}
      />
      <StatCard
        label="WIN RATE"
        value={`${winRate}%`}
        sub={`${winners} / ${closed.length} trades`}
        color={+winRate >= 60 ? theme.green : theme.orange}
      />
      <StatCard
        label="TAX OWED"
        value={fmt(totalTax)}
        sub="30% short-term rate"
        color={theme.red}
      />
      <StatCard
        label="TRADES"
        value={`${trades.length} / ${MAX_TRADES}`}
        sub={`${MAX_TRADES - trades.length} remaining`}
        color={theme.purple}
      />
      <StatCard
        label="MULTIPLIER"
        value={`${multi}x`}
        sub="Since inception"
        color={theme.orange}
      />
    </div>
  );
}