import React, { useState } from 'react';
import { useTheme } from '../App';

const FIELDS = [
  { label: 'Stock Name',      key: 'stockName',  type: 'text',   ph: 'Apple Inc.' },
  { label: 'Symbol',          key: 'symbol',     type: 'text',   ph: 'AAPL'       },
  { label: 'Entry Date',      key: 'entryDate',  type: 'date',   ph: ''           },
  { label: 'Entry Price ($)', key: 'entryPrice', type: 'number', ph: '0.00'       },
  { label: 'Stop Loss ($)',   key: 'stopLoss',   type: 'number', ph: '0.00'       },
  { label: 'Exit Price ($)',  key: 'exitPrice',  type: 'number', ph: '0.00'       },
];

export default function TradeModal({ trade, onClose, onSave }) {
  const theme = useTheme();
  const [form, setForm] = useState(
    trade
      ? { ...trade, entryPrice: trade.entryPrice ?? '', stopLoss: trade.stopLoss ?? '', exitPrice: trade.exitPrice ?? '' }
      : { stockName: '', symbol: '', entryDate: '', entryPrice: '', stopLoss: '', exitPrice: '', status: 'open' }
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.stockName || !form.symbol || !form.entryDate || !form.entryPrice) {
      alert('Please fill in Stock Name, Symbol, Entry Date and Entry Price.');
      return;
    }
    onSave({
      ...form,
      entryPrice: parseFloat(form.entryPrice),
      stopLoss:   parseFloat(form.stopLoss) || 0,
      exitPrice:  form.exitPrice !== '' ? parseFloat(form.exitPrice) : null,
    });
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 10,
    color: theme.text,                     // ← was hardcoded #fff
    fontSize: 14,
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 11, color: theme.textMuted,  // ← was hardcoded #555
    letterSpacing: 1.5, marginBottom: 6, display: 'block',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: theme.bgSecondary,     // ← was hardcoded #0d1117
        border: `1px solid ${theme.border}`,
        borderRadius: 20, padding: 36,
        width: 520, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: theme.name === 'light' ? '0 8px 40px rgba(0,0,0,0.15)' : '0 8px 40px rgba(0,0,0,0.6)',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: theme.text }}>
            {trade ? 'Edit Trade' : 'New Trade'}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 22, lineHeight: 1 }}
          >✕</button>
        </div>

        {/* Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {FIELDS.map(({ label, key, type, ph }) => (
            <div key={key}>
              <label style={labelStyle}>{label.toUpperCase()}</label>
              <input
                type={type}
                placeholder={ph}
                value={form[key] ?? ''}
                onChange={e => set(key, e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}
          <div>
            <label style={labelStyle}>STATUS</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: 'transparent', color: theme.textMuted,
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >Cancel</button>
          <button
            onClick={handleSave}
            style={{
              flex: 2, padding: '12px 0', borderRadius: 10, border: 'none',
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
              color: theme.name === 'dark' ? '#060a0f' : '#ffffff',  // ← contrast-safe
              fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {trade ? 'Update Trade' : 'Add Trade'}
          </button>
        </div>
      </div>
    </div>
  );
}