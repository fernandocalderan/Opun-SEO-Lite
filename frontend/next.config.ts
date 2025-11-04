import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    allowedOrigins: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://192.168.1.37:3000",
    ],
  },
};

export default nextConfig;
