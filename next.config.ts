import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lohdrrezrtmcupuogytt.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/event-images/**",
      },
    ],
  },
};

export default nextConfig;
