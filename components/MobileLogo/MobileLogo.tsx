"use client";
import Image from "next/image";
import { useTheme } from "next-themes";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export function MobileLogo() {
  const { theme, systemTheme } = useTheme();

  const isMobile = useMediaQuery("(max-width: 768px)");
  if (!isMobile) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc =
    currentTheme === "dark" ? "/logo_white.png" : "/logo_black.png";

  return (
    <div className="flex justify-center my-4">
      <Image src={logoSrc} alt="Logo" width={50} height={40} priority />
    </div>
  );
}
