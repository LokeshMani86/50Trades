// ─── API Service ──────────────────────────────────────────────────────────────
// Connects to your Node.js/Express backend which talks to AWS RDS (PostgreSQL).
// Set REACT_APP_API_URL in your .env file.

import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://7rh718sms4.execute-api.us-east-1.amazonaws.com/api';

// Attach Azure AD Bearer token to every request
export function setAuthToken(token) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

// ─── Trades CRUD ──────────────────────────────────────────────────────────────

export const tradesApi = {
  getAll: () =>
    axios.get(`${API_BASE}/trades`).then(r => r.data),

  create: (trade) =>
    axios.post(`${API_BASE}/trades`, trade).then(r => r.data),

  update: (id, trade) =>
    axios.put(`${API_BASE}/trades/${id}`, trade).then(r => r.data),

  delete: (id) =>
    axios.delete(`${API_BASE}/trades/${id}`).then(r => r.data),
};

// ─── Usage Notes ──────────────────────────────────────────────────────────────
// When Azure AD is live, get the access token from MSAL and call setAuthToken():
//
//   const { instance, accounts } = useMsal();
//   const response = await instance.acquireTokenSilent({
//     ...loginRequest,
//     account: accounts[0],
//   });
//   setAuthToken(response.accessToken);
//
// Your Express backend should validate this JWT against Azure AD's JWKS endpoint.
