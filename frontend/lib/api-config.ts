// API configuration
// Use relative URLs - Next.js API routes will proxy to backend
export const getApiUrl = (path: string) => {
  // Ensure path starts with /
  return path.startsWith('/') ? path : `/${path}`;
};
