import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Export static assets so we can host cheaply on S3/CloudFront later.
  output: "export",
};

export default nextConfig;
