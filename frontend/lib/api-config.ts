// API configuration
export const getApiUrl = (path: string) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // In browser, use current hostname with port 9000
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:9000/${cleanPath}`;
  }

  // On server side (SSR/SSG), use localhost
  return `http://localhost:9000/${cleanPath}`;
};
