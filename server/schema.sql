-- ─── AWS RDS PostgreSQL Schema ────────────────────────────────────────────────
-- Run this on your RDS instance to create the trades table.
--
-- Connect via psql:
--   psql -h <RDS_HOST> -U <RDS_USERNAME> -d <RDS_DATABASE>
-- Then run:
--   \i schema.sql

CREATE TABLE IF NOT EXISTS trades (
  id           SERIAL        PRIMARY KEY,
  stock_name   VARCHAR(255)  NOT NULL,
  symbol       VARCHAR(20)   NOT NULL,
  entry_date   DATE          NOT NULL,
  entry_price  NUMERIC(18,4) NOT NULL,
  stop_loss    NUMERIC(18,4),
  exit_price   NUMERIC(18,4),
  status       VARCHAR(10)   NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for fast date-ordered queries
CREATE INDEX IF NOT EXISTS idx_trades_entry_date ON trades (entry_date ASC);

-- Optional: auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sample data (remove in production)
INSERT INTO trades (stock_name, symbol, entry_date, entry_price, stop_loss, exit_price, status) VALUES
  ('Apple Inc.',          'AAPL', '2024-01-15', 182.50,  175.00, 198.30,  'closed'),
  ('NVIDIA Corp.',        'NVDA', '2024-02-03', 620.00,  590.00, 785.40,  'closed'),
  ('Tesla Inc.',          'TSLA', '2024-02-20', 196.00,  185.00, 178.50,  'closed'),
  ('Microsoft Corp.',     'MSFT', '2024-03-10', 415.00,  400.00, 467.20,  'closed'),
  ('Amazon.com',          'AMZN', '2024-03-25', 178.50,  168.00, 192.80,  'closed'),
  ('Broadcom Inc.',       'AVGO', '2024-06-01', 1580.00, 1520.00, NULL,   'open');
