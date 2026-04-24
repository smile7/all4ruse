import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imgrabo.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lohdrrezrtmcupuogytt.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/event-images/**",
      },
    ],
    // Cache optimized images in Next.js image cache for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // devIndicators: false,
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
