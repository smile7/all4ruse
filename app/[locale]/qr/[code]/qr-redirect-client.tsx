"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

type QrRedirectClientProps = {
  locale: string;
  code: string;
};

export function QrRedirectClient({ locale, code }: QrRedirectClientProps) {
  const t = useTranslations("QrRedirect");
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false);

  useEffect(() => {
    if (document.readyState === "complete") {
      setIsPageLoaded(true);
    } else {
      const handleLoad = () => setIsPageLoaded(true);
      window.addEventListener("load", handleLoad, { once: true });

      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  useEffect(() => {
    if (!isPageLoaded || !isImageReady) return;

    const timeoutId = window.setTimeout(() => {
      window.location.replace(`/${locale}`);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [isImageReady, isPageLoaded, locale]);

  return (
    <main className="mx-auto flex h-[100svh] w-full max-w-2xl items-start justify-center overflow-hidden px-4 pb-4 pt-3 sm:px-6">
      <div className="w-full overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="relative aspect-[5/4] w-full sm:aspect-[16/10]">
          <Image
            src="/sponsors/wine.JPG"
            alt=""
            fill
            onLoad={() => setIsImageReady(true)}
            onError={() => setIsImageReady(true)}
            priority
            sizes="(max-width: 640px) 100vw, 42rem"
            className="object-cover"
          />
        </div>
        <div className="px-6 py-8 text-center sm:px-8">
          <h1 className="text-4xl font-bold tracking-[0.08em] text-foreground sm:text-5xl">
            {t("cheers")}
          </h1>
          <p className="mt-4 text-lg font-medium text-foreground">
            {t("redirectingHome")}
          </p>
        </div>
      </div>
    </main>
  );
}
