// Centralized API configuration
// Auto-detects environment: uses Render cloud backend on production / Vercel, and localhost on local dev
export const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL as string) ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://sda-sabbath-school-registry.onrender.com/api'
    : 'http://localhost:3001/api');
