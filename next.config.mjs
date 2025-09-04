/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
