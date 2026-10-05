import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      // The blog used to live on blog.chatmansecurityandfire.com (GoHighLevel).
      // Once that subdomain points at this site, old links land on /blog with
      // the same slug instead of a 404.
      {
        source: "/:slug*",
        has: [{ type: "host", value: "blog.chatmansecurityandfire.com" }],
        destination: "https://www.chatmansecurityandfire.com/blog/:slug*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
