import type { Metadata } from "next";

import { QrRedirectClient } from "./qr-redirect-client";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function QrRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;

  return <QrRedirectClient locale={locale} code={code} />;
}
