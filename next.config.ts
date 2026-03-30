import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/marsh-harrier",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
