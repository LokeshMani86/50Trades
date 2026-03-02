# 50 Trades to a Billion — Trade Journal

A full-stack SPA for tracking your journey from **$100,000 → $1,000,000,000** in 50 trades.

Built with **React**, **Node.js/Express**, **AWS RDS (PostgreSQL)**, and **Azure Active Directory**.

---

## Project Structure

```
trades-app/
├── public/
│   └── index.html
├── src/
│   ├── App.js                  # Root component, routing logic
│   ├── index.js                # React entry point
│   ├── authConfig.js           # Azure AD / MSAL configuration ← fill this in
│   ├── api.js                  # Axios API service layer
│   ├── data.js                 # Mock data, trade computation, formatters
│   └── components/
│       ├── LoginPage.jsx       # Azure AD login screen
│       ├── Navbar.jsx          # Top navigation bar
│       ├── ProgressBar.jsx     # $100K → $1B log-scale progress
│       ├── StatCards.jsx       # Capital, P&L, win rate, tax summary
│       ├── TradeTable.jsx      # Sortable/filterable trade table
│       ├── TradeModal.jsx      # Add / edit trade form
├── server/
│   ├── index.js                # Express API server
│   ├── schema.sql              # AWS RDS PostgreSQL schema
│   └── package.json
├── .env.example                # Environment variable template
└── package.json
```

---

## Quick Start (Frontend — Mock Mode)

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
```

Open [http://localhost:3000](http://localhost:3000). The login is mocked — click "Continue with Microsoft Azure AD" to enter.

---

## Connecting Azure Active Directory

1. Go to [portal.azure.com](https://portal.azure.com)
2. Navigate to **Azure Active Directory → App Registrations → New Registration**
3. Set redirect URI to `http://localhost:3000` (add your prod domain too)
4. Copy **Application (client) ID** and **Directory (tenant) ID**
5. Edit `src/authConfig.js`:

```js
export const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID",
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
    redirectUri: window.location.origin,
  },
};
```

6. In `src/components/LoginPage.jsx`, replace the mock login block with:

```js
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';

const { instance } = useMsal();
const response = await instance.loginPopup(loginRequest);
onLogin(response.account);
```

7. Wrap `<App />` in `src/index.js` with `<MsalProvider instance={msalInstance}>`.

---

## Setting Up the Backend (Node.js + AWS RDS)

### 1. Create AWS RDS Instance
- Go to AWS Console → RDS → Create Database
- Engine: **PostgreSQL**
- Instance: `db.t3.micro` (free tier eligible)
- Enable **Public accessibility** for initial setup
- Note your endpoint, username, and password

### 2. Run the Schema

```bash
psql -h <RDS_HOST> -U postgres -d trades_db -f server/schema.sql
```

### 3. Configure Environment

```bash
cd server
cp ../.env.example .env
# Fill in your RDS and Azure credentials
```

### 4. Start the Backend

```bash
cd server
npm install
npm run dev
```

### 5. Connect Frontend to Backend

Set in your frontend `.env`:
```
REACT_APP_API_URL=http://localhost:4000/api
```

Then in `src/App.js`, replace `mockTrades` state initialization with an API call to `tradesApi.getAll()`.

---

## Business Logic

| Rule | Detail |
|------|--------|
| Starting capital | $100,000 |
| Compounding | 100% of capital deployed each trade |
| Tax rate | 30% on profitable trades (short-term gains) |
| Calculation | `netPnL = rawPnL - tax`, `capitalAfter = capitalBefore + netPnL` |
| Progress scale | Logarithmic ($100K → $1M → $10M → $100M → $1B) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Syne + JetBrains Mono fonts |
| Auth | Azure Active Directory (MSAL) |
| API | Node.js + Express |
| Database | AWS RDS PostgreSQL |
| Deployment | Vercel (frontend) + AWS EC2/Lambda (backend) |
