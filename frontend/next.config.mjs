const withPWA = (() => {
  try {
    return require('next-pwa');
  } catch (e) {
    console.warn("next-pwa not found, PWA features will be disabled.");
    return (config) => config; // Return a no-op function if next-pwa is not found
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})({
  output: "standalone",
  eslint: {
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
      {
        protocol: "https",
        hostname: "d2gmd4btla74l2.cloudfront.net",
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
});

export default nextConfig;
