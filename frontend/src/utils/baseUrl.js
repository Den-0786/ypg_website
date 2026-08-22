// Base URL utility for API endpoints
export const getBaseUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-website.ahinsandistrictypg.com"
  );
};

export default getBaseUrl;
