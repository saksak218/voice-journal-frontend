// lib/auth.ts (or utils/auth.ts)
export const TOKEN_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  ADMIN_TOKEN: "adminToken",
} as const;

export const tokenManager = {
  // Set tokens
  setTokens: (tokens: {
    accessToken: string;
    refreshToken: string;
    adminToken?: string;
  }) => {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    if (tokens.adminToken) {
      localStorage.setItem(TOKEN_KEYS.ADMIN_TOKEN, tokens.adminToken);
    }
  },

  // Get tokens
  getAccessToken: () => localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN),
  getRefreshToken: () => localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN),
  getAdminToken: () => localStorage.getItem(TOKEN_KEYS.ADMIN_TOKEN),

  // Clear tokens
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.ADMIN_TOKEN);
  },

  // Check if tokens exist
  hasTokens: () => {
    return !!localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  // Check if user is admin
  isAdmin: () => {
    return !!localStorage.getItem(TOKEN_KEYS.ADMIN_TOKEN);
  },
};
