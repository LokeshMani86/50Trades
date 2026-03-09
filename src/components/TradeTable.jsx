import React, { useState } from 'react';
import { fmt, fmtPct } from '../data';
import { useTheme } from '../App';

const COLS = [
  { key: 'id',            label: '#'                 },
  { key: 'stockName',     label: 'Stock'             },
  { key: 'symbol',        label: 'Symbol'            },
  { key: 'entryDate',     label: 'Entry Date'        },
  { key: 'capitalBefore', label: 'Capital Allocated' },
  { key: 'entryPrice',    label: 'Entry Price'       },
  { key: 'stopLoss',      label: 'Stop Loss'         },
  { key: 'exitPrice',     label: 'Exit Price'        },
  { key: 'netPnL',        label: 'P/L (Net)'         },
  { key: 'pnlMargin',     label: 'P/L %'             },
  { key: 'tax',           label: 'Tax Owed'          },
  { key: 'capitalAfter',  label: 'Capital After'     },
];

export default function TradeTable({ trades, rawTrades, onEdit, onDelete, isAdmin }) {
  const theme = useTheme();
  const [sortKey, setSortKey]     = useState('id');
  const [sortDir, setSortDir]     = useState(1);
  const [filter, setFilter]       = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => -d);
    else { setSortKey(key); setSortDir(1); }
  };

  const filtered = trades.filter(t =>
    t.stockName.toLowerCase().includes(filter.toLowerCase()) ||
    t.symbol.toLowerCase().includes(filter.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (av == null) return 1;
    if (bv == null) return -1;
    return (typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))) * sortDir;
  });

  const mono = (color, bold = false) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13, color, fontWeight: bold ? 700 : 400,
  });

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', color: theme.text }}>Trade Log</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: theme.textMuted }}>
            Full capital compounded each trade · 30% tax on profitable exits
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search stock or symbol..."
            style={{ padding: '9px 14px', background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, borderRadius: 10, color: theme.text, fontSize: 13, outline: 'none', width: 220, fontFamily: 'inherit' }}
          />
          {isAdmin && (
            <button
              onClick={() => onEdit(null)}
              style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`, color: theme.name === 'dark' ? '#060a0f' : '#ffffff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: `0 0 20px ${theme.accentGlow}` }}
            >+ Add Trade</button>
          )}
        </div>
      </div>

      <div style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: theme.name === 'light' ? '0 1px 6px rgba(0,0,0,0.07)' : 'none' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: theme.name === 'light' ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                {COLS.map(c => (
                  <th key={c.key} onClick={() => handleSort(c.key)}
                    style={{ padding: '10px 14px', fontSize: 10, color: sortKey === c.key ? theme.thSortColor : theme.thColor, letterSpacing: 1.5, textAlign: 'left', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: `1px solid ${theme.border}`, userSelect: 'none', transition: 'color 0.2s' }}>
                    {c.label} {sortKey === c.key ? (sortDir === 1 ? '↑' : '↓') : ''}
                  </th>
                ))}
                {isAdmin && (
                  <th style={{ padding: '10px 14px', fontSize: 10, color: theme.thColor, letterSpacing: 1.5, textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.border}` }}>ACTIONS</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => {
                const win    = t.netPnL > 0;
                const isOpen = t.status === 'open';
                return (
                  <tr key={t.id}
                    style={{ borderBottom: `1px solid ${theme.trBorder}`, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = theme.trHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    <td style={{ padding: '14px' }}><span style={mono(theme.textFaint)}>{i + 1}</span></td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isOpen && <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent, display: 'inline-block', boxShadow: `0 0 8px ${theme.accentGlow}`, flexShrink: 0 }} />}
                        <span style={{ fontSize: 14, fontWeight: 700, color: theme.text, whiteSpace: 'nowrap' }}>{t.stockName}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 6, background: theme.purpleSubtle, border: `1px solid ${theme.purpleBorder}`, fontSize: 12, fontWeight: 700, color: theme.purple, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>{t.symbol}</span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={mono(theme.textMuted)}>{String(t.entryDate).slice(0, 10)}</span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={mono(theme.accent, true)}>{fmt(t.capitalBefore)}</span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={mono(theme.text)}>{fmt(t.entryPrice)}</span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={mono(theme.monoRed)}>{fmt(t.stopLoss)}</span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={mono(isOpen ? theme.textFaint : theme.text)}>{isOpen ? '—' : fmt(t.exitPrice)}</span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={mono(isOpen ? theme.textFaint : win ? theme.green : theme.red, true)}>
                        {isOpen ? '—' : `${win ? '+' : ''}${fmt(t.netPnL)}`}
                      </span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      {isOpen
                        ? <span style={mono(theme.textFaint)}>—</span>
                        : <span style={{ padding: '3px 10px', borderRadius: 6, background: win ? theme.greenSubtle : theme.redSubtle, border: `1px solid ${win ? theme.greenBorder : theme.redBorder}`, fontSize: 12, fontWeight: 700, color: win ? theme.green : theme.red, fontFamily: "'JetBrains Mono', monospace" }}>{fmtPct(t.pnlMargin)}</span>
                      }
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={mono(isOpen || t.tax === 0 ? theme.textFaint : theme.orange)}>
                        {isOpen || t.tax === 0 ? '—' : fmt(t.tax)}
                      </span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      {isOpen
                        ? <span style={mono(theme.textFaint)}>In progress</span>
                        : <span style={mono(theme.text, true)}>{fmt(t.capitalAfter)}</span>
                      }
                    </td>

                    {isAdmin && (
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => onEdit(rawTrades.find(r => r.id === t.id))}
                            style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Edit</button>
                          <button onClick={() => setConfirmId(t.id)}
                            style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${theme.redBorder}`, background: theme.redBg, color: theme.red, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Del</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 13 : 12} style={{ padding: '48px', textAlign: 'center', color: theme.textMuted, fontSize: 14 }}>
                    No trades found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent, display: 'inline-block', boxShadow: `0 0 8px ${theme.accentGlow}` }} />
          <span style={{ fontSize: 11, color: theme.textMuted }}>Open position</span>
        </div>
        <div style={{ fontSize: 11, color: theme.textMuted }}>Tax rate: 30% · Full capital compounding · All figures in USD</div>
      </div>

      {isAdmin && confirmId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: theme.bgSecondary, border: `1px solid ${theme.redBorder}`, borderRadius: 16, padding: 32, textAlign: 'center', maxWidth: 360 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: theme.text }}>Delete Trade?</div>
            <p style={{ fontSize: 14, color: theme.textMuted, marginBottom: 24 }}>This will remove the trade and recalculate all subsequent P&L values.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmId(null)} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => { onDelete(confirmId); setConfirmId(null); }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: theme.redSubtle, color: theme.red, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}