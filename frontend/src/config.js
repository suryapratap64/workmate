const isProd = import.meta.env.PROD;

export const API_URL = isProd
  ? "https://workmate-backend-1.onrender.com"
  : "http://localhost:8000";

export const WS_URL = isProd
  ? "wss://workmate-backend-1.onrender.com"
  : "ws://localhost:8000";
