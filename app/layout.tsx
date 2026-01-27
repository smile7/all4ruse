import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
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

export const metadata: Metadata = {
  title: "All4Ruse",
  description: "Building something amazing with Next.js and Supabase",
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
      </body>
    </html>
  );
}
