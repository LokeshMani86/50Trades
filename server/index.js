const serverless = require('serverless-http');
const express    = require('express');
const cors       = require('cors');
const { Pool }   = require('pg');

const app = express();

const corsOptions = {
  origin: '*',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ← handles preflight for ALL routes
app.use(express.json());

const pool = new Pool({
  host:     process.env.RDS_HOST,
  port:     parseInt(process.env.RDS_PORT) || 5432,
  database: process.env.RDS_DATABASE,
  user:     process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  ssl:      { rejectUnauthorized: false },
  max:      5,
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

app.get('/api/trades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trades ORDER BY entry_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.delete('/api/trades/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM trades WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

module.exports.handler = serverless(app);