import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "govpgcollarang.cgstate.gov.in",
      },
    ],
  },
};

export default nextConfig;
