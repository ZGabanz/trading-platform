/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  swcMinify: true,
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://trading-platform-backend-g3us.onrender.com"
        : "http://localhost:4000"),
  },
  async rewrites() {
    // Proxy API calls to backend in development
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/backend/:path*",
          destination: "http://localhost:4000/api/:path*",
        },
      ];
    }
    return [];
  },
  // Optimize for production
  experimental: {
    optimizeCss: true,
  },
  // Disable telemetry for cleaner logs
  telemetry: {
    disabled: true,
  },
};

module.exports = nextConfig;
