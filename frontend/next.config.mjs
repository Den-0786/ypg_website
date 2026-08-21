/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      // Local development
      {
        protocol: "http",
        hostname: "localhost",
        port: "8002",
        pathname: "/media/**",
      },
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
      {
        protocol: "https",
        hostname: "d2gmd4btla74l2.cloudfront.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
    const backend =
      (raw && /^https?:\/\//.test(raw) ? raw : null) ||
      (process.env.NODE_ENV === "production"
        ? "https://api-website.ahinsandistrictypg.com"
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
