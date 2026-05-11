import { NextResponse } from "next/server";

import { parseRuseOnTheDanubeEventPage } from "@/lib/ruse-on-the-danube";
import { createClient } from "@/lib/supabase/server";

const RUSE_ON_THE_DANUBE_HOST = "ruseonthedanube.com";
const BROWSER_HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "bg-BG,bg;q=0.9,en;q=0.8",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}) as any);
    const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";

    if (!rawUrl) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid Ruse on the Danube URL" },
        { status: 400 },
      );
    }

    if (parsedUrl.hostname.replace(/^www\./i, "") !== RUSE_ON_THE_DANUBE_HOST) {
      return NextResponse.json(
        { error: "Only Ruse on the Danube URLs are supported" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in first." },
        { status: 401 },
      );
    }

    const pageResponse = await fetch(parsedUrl.toString(), {
      cache: "no-store",
      headers: BROWSER_HEADERS,
    });

    if (!pageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to load Ruse on the Danube page" },
        { status: 400 },
      );
    }

    const html = await pageResponse.text();
    const normalized = parseRuseOnTheDanubeEventPage(
      html,
      pageResponse.url || rawUrl,
    );

    if (!normalized) {
      return NextResponse.json(
        { error: "Could not parse this Ruse on the Danube event page" },
        { status: 400 },
      );
    }

    return NextResponse.json(normalized);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to import event from Ruse on the Danube" },
      { status: 500 },
    );
  }
}
