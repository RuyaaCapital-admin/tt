import { createClient } // REMOVED Base44 import;
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = /* REMOVED Base44 createClient( ... ) */({
  appId: "6886786a3e4c3373ffb144ac", 
  requiresAuth: true // Ensure authentication is required for all operations
});
