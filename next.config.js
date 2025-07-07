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
  // Exclude exchange-rate-system from TypeScript compilation
  typescript: {
    ignoreBuildErrors: false,
  },
  // Exclude exchange-rate-system from the build process
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ignore exchange-rate-system directory during build
    config.module.rules.push({
      test: /\.tsx?$/,
      include: /exchange-rate-system/,
      use: "ignore-loader",
    });

    return config;
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
  // Disable problematic optimizations for production builds
  experimental: {
    // Remove optimizeCss to fix critters module error
  },
  // Configure dynamic routes to avoid static generation issues
  generateEtags: false,
  poweredByHeader: false,
};

module.exports = nextConfig;
