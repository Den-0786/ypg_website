// Configuration utility for API endpoints
export const getApiBaseUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"
  );
};

// Quiz API connects to YPG Database system (separate from website backend)
export const getQuizApiBaseUrl = () => {
  return "https://ypg-database-system.onrender.com";
};

export const getSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://ypg-website.vercel.app";
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

export const buildImageSrc = (pathOrUrl) => {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  const baseUrl = getApiBaseUrl();
  const clean = pathOrUrl.startsWith("/") ? pathOrUrl.slice(1) : pathOrUrl;
  return `${baseUrl}/${clean}`;
};

// Helper function to build Quiz API URLs
export const buildQuizApiUrl = (endpoint) => {
  const baseUrl = getQuizApiBaseUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};
