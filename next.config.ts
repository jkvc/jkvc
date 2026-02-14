import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.CHECK_BUILD === "1" ? ".next-check" : ".next",
};

export default nextConfig;
