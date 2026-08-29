// Centralized API configuration
// When deployed on Vercel, set VITE_BACKEND_URL to your live Render backend URL (e.g. https://sda-backend.onrender.com/api)
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:3001/api';
