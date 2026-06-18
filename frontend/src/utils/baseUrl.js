// Base URL utility for API endpoints
export const getBaseUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"
  );
};

export default getBaseUrl;
