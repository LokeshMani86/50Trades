// ─── Node.js / Express Backend ────────────────────────────────────────────────
// Connects React frontend → AWS RDS (PostgreSQL)
// Validates Azure AD JWT tokens on every request.
//
// Prerequisites:
//   npm install express cors pg jsonwebtoken jwks-rsa dotenv

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const { Pool }   = require('pg');
const jwt        = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const app  = express();
const port = process.env.PORT || 4000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// ── AWS RDS (PostgreSQL) Pool ──────────────────────────────────────────────────
const pool = new Pool({
  host:     process.env.RDS_HOST,       // e.g. mydb.xxxx.us-east-1.rds.amazonaws.com
  port:     process.env.RDS_PORT || 5432,
  database: process.env.RDS_DATABASE,
  user:     process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  ssl:      { rejectUnauthorized: false }, // Required for AWS RDS
});

// ── Azure AD JWT Validation ────────────────────────────────────────────────────
const jwks = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/discovery/v2.0/keys`,
});

function getKey(header, callback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    callback(err, err ? null : key.getPublicKey());
  });
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token', details: err.message });
    req.user = decoded;
    next();
  });
}

// ── Routes ─────────────────────────────────────────────────────────────────────

// GET /api/trades — all trades
app.get('/api/trades',  async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trades ORDER BY entry_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/trades — create trade
app.post('/api/trades', requireAuth, async (req, res) => {
  const { stockName, symbol, entryDate, entryPrice, stopLoss, exitPrice, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO trades (stock_name, symbol, entry_date, entry_price, stop_loss, exit_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [stockName, symbol, entryDate, entryPrice, stopLoss, exitPrice || null, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/trades/:id — update trade
app.put('/api/trades/:id', requireAuth, async (req, res) => {
  const { stockName, symbol, entryDate, entryPrice, stopLoss, exitPrice, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE trades SET stock_name=$1, symbol=$2, entry_date=$3, entry_price=$4,
       stop_loss=$5, exit_price=$6, status=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [stockName, symbol, entryDate, entryPrice, stopLoss, exitPrice || null, status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Trade not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/trades/:id — delete trade
app.delete('/api/trades/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM trades WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`✅  API server running on http://localhost:${port}`);
  console.log(`   RDS: ${process.env.RDS_HOST}:${process.env.RDS_PORT}/${process.env.RDS_DATABASE}`);
});
