import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        // WordPress-hosted images on grapow.net (served via Jetpack CDN)
        protocol: "https",
        hostname: "i0.wp.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
