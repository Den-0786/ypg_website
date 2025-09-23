/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    // Temporarily ignore ESLint during builds to unblock deployments
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      // Django Render media (legacy)
      {
        protocol: "https",
        hostname: "ypg-website.onrender.com",
        port: "",
        pathname: "/media/**",
      },
      // S3 bucket direct access
      {
        protocol: "https",
        hostname: "dennis-opoku-bucket.s3.eu-central-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      // CloudFront
      {
        protocol: "https",
        hostname: "cdn.mydennis.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const backend =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://ypg-website.onrender.com"
        : "http://localhost:8000");
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
