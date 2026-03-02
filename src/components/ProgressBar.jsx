import React from 'react';
import { fmt, INITIAL_CAPITAL, TARGET_CAPITAL } from '../data';
import { useTheme } from '../App';

const MILESTONES = [
  { label: '100K', val: 100_000 },
  { label: '1M',   val: 1_000_000 },
  { label: '10M',  val: 10_000_000 },
  { label: '100M', val: 100_000_000 },
  { label: '1B',   val: 1_000_000_000 },
];

function logProgress(current) {
  const logCurrent = Math.log10(current / INITIAL_CAPITAL);
  const logTarget  = Math.log10(TARGET_CAPITAL / INITIAL_CAPITAL);
  return Math.min((logCurrent / logTarget) * 100, 100);
}

export default function ProgressBar({ currentCapital }) {
  const theme = useTheme();
  const pct   = logProgress(currentCapital);

  return (
    <div style={{
      padding: '20px 24px',
      background: theme.accentSubtle,
      border: `1px solid ${theme.borderAccent}`,
      borderRadius: 16,
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.accentText, letterSpacing: 2, marginBottom: 4 }}>
            JOURNEY PROGRESS · LOG SCALE
          </div>
          <div style={{
            fontSize: 28, fontWeight: 800, color: theme.text,
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: -1,
          }}>
            {fmt(currentCapital)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: theme.textMuted, letterSpacing: 1 }}>TARGET</div>
          <div style={{
            fontSize: 18, fontWeight: 700, color: theme.textMuted,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            $1,000,000,000
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'relative', height: 8,
        background: theme.progressTrack,
        borderRadius: 99, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentDark})`,
          borderRadius: 99, transition: 'width 0.8s ease',
          boxShadow: `0 0 12px ${theme.accentGlow}`,
        }} />
      </div>

      {/* Milestones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        {MILESTONES.map(m => {
          const reached = currentCapital >= m.val;
          return (
            <div key={m.label} style={{ textAlign: 'center' }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', margin: '0 auto 4px',
                background: reached ? theme.accent : theme.progressTrack,
                boxShadow: reached ? `0 0 8px ${theme.accentGlow}` : 'none',
                transition: 'all 0.3s',
              }} />
              <div style={{
                fontSize: 10,
                color: reached ? theme.accentText : theme.textFaint,
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5,
              }}>
                {m.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}