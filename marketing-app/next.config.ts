import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xowephnjpfixseglbsxc.supabase.co",
      },
    ],
  },
};

export default nextConfig;
