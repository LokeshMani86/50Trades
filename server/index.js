// ─── Node.js / Express Backend ────────────────────────────────────────────────
// Connects React frontend → AWS RDS (PostgreSQL)
//
// Prerequisites:
//   npm install express cors pg dotenv

require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const { Pool } = require('pg');

const app  = express();
const port = process.env.PORT || 8080;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// ── AWS RDS (PostgreSQL) Pool ──────────────────────────────────────────────────
const pool = new Pool({
  host:     process.env.RDS_HOST,
  port:     parseInt(process.env.RDS_PORT) || 5432,
  database: process.env.RDS_DATABASE,
  user:     process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  ssl:      { rejectUnauthorized: false }, // Required for AWS RDS
});

// Test DB connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌  RDS connection failed:', err.message);
    console.error('    Check your .env RDS_HOST, RDS_USERNAME, RDS_PASSWORD, RDS_DATABASE');
  } else {
    console.log('✅  Connected to AWS RDS PostgreSQL');
    release();
  }
});

// ── Azure AD JWT Validation ────────────────────────────────────────────────────
// TODO: When real Azure AD is configured, uncomment this block and add
//       requireAuth as the second argument to each route below.
//
// const jwt        = require('jsonwebtoken');
// const jwksClient = require('jwks-rsa');
// const jwks = jwksClient({
//   jwksUri: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/discovery/v2.0/keys`,
// });
// function getKey(header, callback) {
//   jwks.getSigningKey(header.kid, (err, key) => {
//     callback(err, err ? null : key.getPublicKey());
//   });
// }
// function requireAuth(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith('Bearer ')) {
//     return res.status(401).json({ error: 'Missing authorization header' });
//   }
//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
//     if (err) return res.status(401).json({ error: 'Invalid token', details: err.message });
//     req.user = decoded;
//     next();
//   });
// }

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────────────────────────
// NOTE: requireAuth intentionally removed while Azure AD is mocked on the frontend.
// When going live, add requireAuth as the 2nd arg:
//   app.get('/api/trades', requireAuth, async (req, res) => { ... })

// GET /api/trades — fetch all trades ordered by entry date
app.get('/api/trades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trades ORDER BY entry_date ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/trades:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/trades — create a new trade
app.post('/api/trades', async (req, res) => {
  const { stockName, symbol, entryDate, entryPrice, stopLoss, exitPrice, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO trades (stock_name, symbol, entry_date, entry_price, stop_loss, exit_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [stockName, symbol, entryDate, entryPrice, stopLoss, exitPrice || null, status || 'open']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/trades:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/trades/:id — update an existing trade
app.put('/api/trades/:id', async (req, res) => {
  const { stockName, symbol, entryDate, entryPrice, stopLoss, exitPrice, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE trades
       SET stock_name=$1, symbol=$2, entry_date=$3, entry_price=$4,
           stop_loss=$5, exit_price=$6, status=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [stockName, symbol, entryDate, entryPrice, stopLoss, exitPrice || null, status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Trade not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /api/trades/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/trades/:id — delete a trade
app.delete('/api/trades/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM trades WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/trades/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── 404 catch-all — tells you exactly which route was not found ────────────────
app.use((req, res) => {
  console.warn(`404 — ${req.method} ${req.path}`);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`\n🚀  API server running on http://localhost:${port}`);
  console.log(`    RDS host: ${process.env.RDS_HOST || '(not set — check .env)'}`);
  console.log(`    Database: ${process.env.RDS_DATABASE || '(not set)'}\n`);
});