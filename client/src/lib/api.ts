export const API_URL = (() => {
  const env = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (env) return env;
  if (typeof window === 'undefined') return '';
  const { origin, port } = window.location;
  if (port === '5173') {
    return origin.replace(/:\d+$/, ':5001');
  }
  return origin;
})();