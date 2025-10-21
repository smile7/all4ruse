import { NextRequest, NextResponse } from "next/server";

import { updateSession } from "./lib/supabase/middleware";
const supportedLocales = ["en", "bg"];

export async function middleware(request: NextRequest) {
  const sessionResponse = await updateSession(request);

  if (request.nextUrl.pathname === "/") {
    const acceptLanguage = request.headers.get("accept-language") ?? "";
    let locale = "en";
    if (acceptLanguage) {
      const preferred = acceptLanguage.split(",")[0]?.split("-")[0];
      if (supportedLocales.includes(preferred)) locale = preferred;
    }
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return sessionResponse;
}

export const config = {
  matcher: ["/", "/en/:path*", "/bg/:path*"],
};
