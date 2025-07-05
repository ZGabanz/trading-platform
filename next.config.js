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
        ? process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.RENDER_EXTERNAL_URL || "https://your-app.vercel.app"
        : "http://localhost:3000"),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
