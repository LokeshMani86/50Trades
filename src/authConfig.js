// ─── Azure AD / MSAL Configuration ───────────────────────────────────────────
// Replace these values with your actual Azure AD app registration details.
// Steps to get these:
//  1. Go to https://portal.azure.com
//  2. Navigate to Azure Active Directory → App Registrations → New Registration
//  3. Set redirect URI to: http://localhost:3000 (dev) and your prod domain
//  4. Copy the Application (client) ID and Directory (tenant) ID below

export const msalConfig = {
  auth: {
    clientId: "YOUR_AZURE_CLIENT_ID",           // App (client) ID from Azure portal
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID", // Tenant ID
    redirectUri: window.location.origin,         // Must match Azure portal setting
  },
  cache: {
    cacheLocation: "sessionStorage",             // "localStorage" to persist across tabs
    storeAuthStateInCookie: false,
  },
};

// Scopes requested on login
export const loginRequest = {
  scopes: ["User.Read", "openid", "profile", "email"],
};

// Graph API endpoint to get user profile
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
