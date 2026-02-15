import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.CHECK_BUILD === "1" ? ".next-check" : ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
