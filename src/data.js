// ─── Constants ────────────────────────────────────────────────────────────────
export const INITIAL_CAPITAL = 100000;
export const TAX_RATE = 0.30; // 30% short-term capital gains tax
export const TARGET_CAPITAL = 1_000_000_000; // $1 Billion
export const MAX_TRADES = 50;

// ─── Mock Trade Data ──────────────────────────────────────────────────────────
export const mockTrades = [
  { id: 1,  stockName: "Apple Inc.",           symbol: "AAPL", entryDate: "2024-01-15", entryPrice: 182.50,  stopLoss: 175.00,  exitPrice: 198.30,  status: "closed" },
  { id: 2,  stockName: "NVIDIA Corp.",          symbol: "NVDA", entryDate: "2024-02-03", entryPrice: 620.00,  stopLoss: 590.00,  exitPrice: 785.40,  status: "closed" },
  { id: 3,  stockName: "Tesla Inc.",            symbol: "TSLA", entryDate: "2024-02-20", entryPrice: 196.00,  stopLoss: 185.00,  exitPrice: 178.50,  status: "closed" },
  { id: 4,  stockName: "Microsoft Corp.",       symbol: "MSFT", entryDate: "2024-03-10", entryPrice: 415.00,  stopLoss: 400.00,  exitPrice: 467.20,  status: "closed" },
  { id: 5,  stockName: "Amazon.com",            symbol: "AMZN", entryDate: "2024-03-25", entryPrice: 178.50,  stopLoss: 168.00,  exitPrice: 192.80,  status: "closed" },
  { id: 6,  stockName: "Meta Platforms",        symbol: "META", entryDate: "2024-04-08", entryPrice: 490.00,  stopLoss: 470.00,  exitPrice: 535.00,  status: "closed" },
  { id: 7,  stockName: "Alphabet Inc.",         symbol: "GOOGL", entryDate: "2024-04-22", entryPrice: 162.00, stopLoss: 155.00,  exitPrice: 175.40,  status: "closed" },
  { id: 8,  stockName: "Palantir Tech.",        symbol: "PLTR", entryDate: "2024-05-05", entryPrice: 23.50,   stopLoss: 21.00,   exitPrice: 31.20,   status: "closed" },
  { id: 9,  stockName: "Super Micro Computer",  symbol: "SMCI", entryDate: "2024-05-18", entryPrice: 850.00,  stopLoss: 800.00,  exitPrice: 760.00,  status: "closed" },
  { id: 10, stockName: "Broadcom Inc.",         symbol: "AVGO", entryDate: "2024-06-01", entryPrice: 1580.00, stopLoss: 1520.00, exitPrice: null,     status: "open"   },
];

// ─── Trade Computation ────────────────────────────────────────────────────────
// Full capital compounding: each trade deploys 100% of available capital.
// Tax is deducted on profitable closed trades before next trade capital is set.
export function computeTrades(trades) {
  let capital = INITIAL_CAPITAL;

  return trades.map((t) => {
    const capitalBefore = capital;
    const shares = capitalBefore / t.entryPrice;

    let rawPnL = 0;
    let pnlMargin = 0;
    let tax = 0;
    let netPnL = 0;
    let capitalAfter = capital;

    if (t.status === "closed" && t.exitPrice != null) {
      rawPnL    = (t.exitPrice - t.entryPrice) * shares;
      pnlMargin = ((t.exitPrice - t.entryPrice) / t.entryPrice) * 100;
      tax       = rawPnL > 0 ? rawPnL * TAX_RATE : 0;
      netPnL    = rawPnL - tax;
      capitalAfter = capital + netPnL;
      capital   = capitalAfter; // compound into next trade
    }

    return {
      ...t,
      shares: +shares.toFixed(4),
      rawPnL,
      pnlMargin,
      tax,
      netPnL,
      capitalBefore,
      capitalAfter,
    };
  });
}

// ─── Formatters ───────────────────────────────────────────────────────────────
export const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

export const fmtPct = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

export const fmtCompact = (n) => {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(1)}K`;
  return fmt(n);
};
