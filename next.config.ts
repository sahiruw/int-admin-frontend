import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["hljdzxdmcfyfuzkymqej.supabase.co"],
  },
};

export default nextConfig;
