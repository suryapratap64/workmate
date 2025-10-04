
// export const API_URL = "https://workmate-backend-1.onrender.com";
// export const WS_URL = "wss://workmate-backend-1.onrender.com";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";