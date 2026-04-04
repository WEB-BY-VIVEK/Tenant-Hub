import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

const TOKEN_KEY = "cdg_token";

if (import.meta.env.VITE_API_BASE_URL) {
  setBaseUrl(import.meta.env.VITE_API_BASE_URL);
}

setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));
