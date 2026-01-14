export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Generate a cryptographically secure random state for OAuth.
 * This prevents CSRF attacks by ensuring the state is unpredictable.
 */
const generateSecureState = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  // Use cryptographically secure random state instead of predictable base64
  const state = generateSecureState();

  // Store state in sessionStorage to validate on callback
  sessionStorage.setItem("oauth_state", state);
  sessionStorage.setItem("oauth_redirect", redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

/**
 * Validate OAuth callback state to prevent CSRF attacks.
 */
export const validateOAuthState = (returnedState: string): boolean => {
  const storedState = sessionStorage.getItem("oauth_state");
  sessionStorage.removeItem("oauth_state");
  sessionStorage.removeItem("oauth_redirect");
  return storedState === returnedState;
};
