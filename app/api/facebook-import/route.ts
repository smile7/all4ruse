import { NextResponse } from "next/server";

import { parseFacebookJsonImportData } from "@/lib/facebook-import";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}) as any);
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    if (!/^https?:\/\/(?:www\.)?(?:facebook|fb)\.com\//i.test(url)) {
      return NextResponse.json(
        { error: "Invalid Facebook event URL" },
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

    const token = process.env.APIFY_TOKEN?.trim();
    const actorId = process.env.APIFY_FACEBOOK_EVENTS_ACTOR_ID?.trim();

    if (!token || !actorId) {
      return NextResponse.json(
        {
          error:
            "Facebook import is not configured. Set APIFY_TOKEN and APIFY_FACEBOOK_EVENTS_ACTOR_ID.",
        },
        { status: 500 },
      );
    }

    const apifyUrl = new URL(
      `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`,
    );
    apifyUrl.searchParams.set("token", token);

    const apifyRes = await fetch(apifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startUrls: [url],
        maxItems: 1,
        resultsLimit: 1,
      }),
      cache: "no-store",
    });

    const apifyBody = (await apifyRes.json().catch(() => null)) as
      | unknown
      | { error?: { message?: string } };

    if (!apifyRes.ok || !apifyBody) {
      const errorValue =
        typeof apifyBody === "object" && apifyBody !== null
          ? (apifyBody as { error?: unknown }).error
          : null;
      const message =
        typeof errorValue === "object" &&
        errorValue !== null &&
        "message" in errorValue &&
        typeof (errorValue as { message?: unknown }).message === "string"
          ? (errorValue as { message: string }).message
          : "Apify returned an error";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const items = Array.isArray(apifyBody) ? apifyBody : [];
    if (items.length === 0) {
      return NextResponse.json(
        { error: "No event was returned by Apify." },
        { status: 404 },
      );
    }

    const normalized = parseFacebookJsonImportData(items[0]);

    return NextResponse.json(normalized);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to import event from Facebook" },
      { status: 500 },
    );
  }
}
