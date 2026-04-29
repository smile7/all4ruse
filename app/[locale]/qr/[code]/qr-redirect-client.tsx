"use client";

import { useEffect } from "react";

type QrRedirectClientProps = {
  locale: string;
  code: string;
};

export function QrRedirectClient({ locale, code }: QrRedirectClientProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      window.location.replace(`/${locale}`);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [locale]);

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-2xl items-center justify-center px-6 py-16">
      <div className="w-full rounded-3xl border border-border bg-card px-6 py-8 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
          QR: {code}
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Redirecting to All4Ruse...
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This QR path can be tracked separately in Vercel Analytics.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          If you are not redirected automatically, open the All4Ruse home page.
        </p>
      </div>
    </main>
  );
}
