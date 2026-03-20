import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type NormalizedEvent = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  address: string;
  place: string;
  town: string;
  coverImageUrl: string | null;
};

function extractMetaContent(html: string, property: string): string | null {
  const metaRegex = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const match = html.match(metaRegex);
  if (match?.[1]) return match[1].trim();

  // Also try "name" attribute as a fallback
  const nameRegex = new RegExp(
    `<meta[^>]+name=["']${property}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const nameMatch = html.match(nameRegex);
  if (nameMatch?.[1]) return nameMatch[1].trim();

  return null;
}

function parseJsonLdEvents(html: string): Partial<NormalizedEvent> | null {
  const scriptRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html)) !== null) {
    const jsonText = match[1]?.trim();
    if (!jsonText) continue;

    try {
      const parsed = JSON.parse(jsonText) as any;
      const candidates = Array.isArray(parsed) ? parsed : [parsed];

      for (const node of candidates) {
        if (!node || typeof node !== "object") continue;

        const type = node["@type"];
        const types = Array.isArray(type) ? type : [type];
        if (!types.includes("Event")) continue;

        const title = typeof node.name === "string" ? node.name : "";
        const description =
          typeof node.description === "string" ? node.description : "";

        const start = typeof node.startDate === "string" ? node.startDate : "";
        const end = typeof node.endDate === "string" ? node.endDate : start;

        const location = node.location || {};
        const place = typeof location.name === "string" ? location.name : "";

        const addressObj = location.address || {};
        const address =
          typeof addressObj.streetAddress === "string"
            ? addressObj.streetAddress
            : "";
        const town =
          typeof addressObj.addressLocality === "string"
            ? addressObj.addressLocality
            : "";

        let coverImageUrl: string | null = null;
        if (typeof node.image === "string") {
          coverImageUrl = node.image;
        } else if (Array.isArray(node.image) && node.image[0]) {
          coverImageUrl = String(node.image[0]);
        }

        const toDate = (value: string): string => {
          if (!value) return "";
          const d = new Date(value);
          if (Number.isNaN(d.getTime())) return "";
          return d.toISOString().slice(0, 10);
        };

        const toTime = (value: string): string => {
          if (!value) return "";
          const d = new Date(value);
          if (Number.isNaN(d.getTime())) return "";
          return d.toISOString().slice(11, 16);
        };

        return {
          title,
          description,
          startDate: toDate(start),
          endDate: toDate(end || start),
          startTime: toTime(start),
          endTime: toTime(end),
          address,
          place,
          town,
          coverImageUrl,
        };
      }
    } catch {
      // Ignore JSON-LD parsing errors and continue to next script tag
      continue;
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}) as any);
    const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";

    if (!rawUrl) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    let normalizedUrl = rawUrl;
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    let parsed: URL;
    try {
      parsed = new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const hostname = parsed.hostname.toLowerCase();
    if (!hostname.includes("grabo.bg")) {
      return NextResponse.json(
        { error: "Only Grabo.bg links are supported for this import." },
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

    const allowedUserIds = [
      "288aec4c-e378-45cd-b73b-f52d22998b5b",
      "98b3619c-b0f2-4b15-91e9-0045cf0eac51",
    ];

    if (!allowedUserIds.includes(user.id)) {
      return NextResponse.json(
        { error: "This import feature is currently in private testing." },
        { status: 403 },
      );
    }

    const pageRes = await fetch(normalizedUrl);
    if (!pageRes.ok) {
      return NextResponse.json(
        { error: "Failed to load Grabo page" },
        { status: 400 },
      );
    }

    const html = await pageRes.text();

    // Try to parse structured data first (JSON-LD Event)
    const fromJsonLd = parseJsonLdEvents(html);

    // Fallback to Open Graph metadata when possible
    const ogTitle = extractMetaContent(html, "og:title");
    const ogDescription = extractMetaContent(html, "og:description");
    const ogImage = extractMetaContent(html, "og:image");

    const normalized: NormalizedEvent = {
      title: (fromJsonLd?.title || ogTitle || "").trim(),
      description: (fromJsonLd?.description || ogDescription || "").trim(),
      startDate: fromJsonLd?.startDate ?? "",
      endDate: fromJsonLd?.endDate ?? "",
      startTime: fromJsonLd?.startTime ?? "",
      endTime: fromJsonLd?.endTime ?? "",
      address: fromJsonLd?.address ?? "",
      place: fromJsonLd?.place ?? "",
      town: fromJsonLd?.town ?? "",
      coverImageUrl: fromJsonLd?.coverImageUrl ?? ogImage ?? null,
    };

    // If we couldn't extract even a title, treat as failure
    if (!normalized.title) {
      return NextResponse.json(
        {
          error:
            "Could not extract event information from this Grabo link. Please fill in the details manually.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(normalized);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to import event from Grabo" },
      { status: 500 },
    );
  }
}
