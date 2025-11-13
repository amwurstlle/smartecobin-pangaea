export const API_URL = (() => {
  const env = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (env) return env;
  const { protocol, hostname, port } = window.location;
  const isViteDev = port === '5173';
  const targetPort = isViteDev ? '5001' : (port || '5000');
  return `${protocol}//${hostname}:${targetPort}`;
})();