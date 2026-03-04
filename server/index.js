const serverless = require('serverless-http');
const express    = require('express');
const cors       = require('cors');
const { Pool }   = require('pg');

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: '*',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// ── RDS Pool ───────────────────────────────────────────────────────────────────
const pool = new Pool({
  host:     process.env.RDS_HOST,
  port:     parseInt(process.env.RDS_PORT) || 5432,
  database: process.env.RDS_DATABASE,
  user:     process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  ssl:      { rejectUnauthorized: false },
  max:      5,
});

// ── Credentials ────────────────────────────────────────────────────────────────
// Stored in Lambda environment variables — never in frontend code.
// To update passwords: Lambda → Configuration → Environment variables
const USERS = {
  [process.env.ADMIN_USERNAME || 'lokeshmani32']: {
    password: process.env.ADMIN_PASSWORD || 'Ajaypal@6939',
    role:     'admin',
    name:     'Lokesh',
  },
  [process.env.VIEWER_USERNAME || 'viewer']: {
    password: process.env.VIEWER_PASSWORD || 'Trades@2024',
    role:     'viewer',
    name:     'Viewer',
  },
};

// ── POST /api/login ────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = USERS[username];

  if (!user || user.password !== password) {
    // Generic message — don't reveal whether username or password was wrong
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  res.json({ role: user.role, name: user.name });
});

// ── GET /api/health ────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

// ── GET /api/trades ────────────────────────────────────────────────────────────
app.get('/api/trades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trades ORDER BY entry_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/trades ───────────────────────────────────────────────────────────
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
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/trades/:id ────────────────────────────────────────────────────────
app.put('/api/trades/:id', async (req, res) => {
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

// ── DELETE /api/trades/:id ─────────────────────────────────────────────────────
app.delete('/api/trades/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM trades WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

module.exports.handler = serverless(app);