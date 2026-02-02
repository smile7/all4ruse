import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

// Base next-intl middleware (uses routing.defaultLocale = "bg")
const nextIntlMiddleware = createMiddleware(routing);

// Custom wrapper: always send bare "/" to "/bg" regardless of browser language.
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const url = new URL(`/${routing.defaultLocale}`, request.url);
    return NextResponse.redirect(url);
  }

  return nextIntlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
