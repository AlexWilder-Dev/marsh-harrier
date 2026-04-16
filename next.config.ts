import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "marshharriercowley.co.uk",
      },
    ],
  },
};

export default nextConfig;
