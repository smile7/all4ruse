"use client";

import { GoogleAnalytics } from "@next/third-parties/google";

import { useCookieConsent } from "@/components/CookieConsentProvider";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function AnalyticsWithConsent() {
  const { consent } = useCookieConsent();

  if (!GA_ID) return null;
  if (consent !== "all") return null;

  return <GoogleAnalytics gaId={GA_ID} />;
}

export default AnalyticsWithConsent;
