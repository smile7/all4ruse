import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

import { QueryProvider } from "@/components/QueryProvider";
import { ThemeProvider } from "@/components/theme";
import { TooltipProvider } from "@/components/ui";

import "./globals.css";

const comfortaa = localFont({
  variable: "--font-comfortaa",
  src: [
    {
      path: "../public/fonts/Comfortaa-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Comfortaa-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Comfortaa-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Comfortaa-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Comfortaa-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://all4ruse.com";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "All4Ruse",
  url: siteUrl,
  logo: `${siteUrl}/all4ruse_white.png`,
  sameAs: ["https://www.facebook.com/profile.php?id=61586926929594"],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "All4Ruse – събития в Русе",
    template: "%s | All4Ruse",
  },
  description: "Твоето място за събития в Русе.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "All4Ruse – събития в Русе",
    description: "Твоето място за събития в Русе.",
    url: siteUrl,
    siteName: "All4Ruse",
    type: "website",
    images: [
      {
        url: "/og-home.png",
        width: 1200,
        height: 630,
        alt: "All4Ruse – събития в Русе",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All4Ruse – събития в Русе",
    description: "Твоето място за събития в Русе.",
    images: ["/og-home.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={comfortaa.variable}
    >
      <body
        className={`${comfortaa.className} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster richColors toastOptions={{ duration: 6000 }} />
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
