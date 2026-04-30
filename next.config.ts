import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// Enable Cloudflare Pages dev platform in development
if (process.env.NODE_ENV === "development") {
  const { setupDevPlatform } = await import("@cloudflare/next-on-pages/next-dev");
  await setupDevPlatform();
}

export default nextConfig;
