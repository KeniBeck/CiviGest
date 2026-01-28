export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',
} as const;
