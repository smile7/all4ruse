import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type FacebookPlace = {
  name?: string;
  location?: {
    street?: string;
    city?: string;
  };
};

type FacebookEventResponse = {
  name?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  place?: FacebookPlace | null;
  cover?: {
    source?: string;
  } | null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}) as any);
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const match = url.match(/facebook\.com\/events\/(\d+)/);
    const eventId = match?.[1];

    if (!eventId) {
      return NextResponse.json(
        { error: "Could not extract event ID from URL" },
        { status: 400 },
      );
    }

    // Use per-user Facebook token stored in Supabase profile
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("fb")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(profileError);
      return NextResponse.json(
        { error: "Failed to load profile for Facebook import" },
        { status: 500 },
      );
    }

    const token = (profile as { fb?: string | null } | null)?.fb;
    if (!token) {
      return NextResponse.json(
        { error: "Facebook is not connected for this account." },
        { status: 400 },
      );
    }

    const params = new URLSearchParams({
      fields: "name,description,start_time,end_time,place,cover",
      access_token: token,
    });

    const graphRes = await fetch(
      `https://graph.facebook.com/v20.0/${eventId}?${params.toString()}`,
    );

    const fbBody = (await graphRes
      .json()
      .catch(() => null)) as FacebookEventResponse | null;

    if (!graphRes.ok || !fbBody) {
      const message =
        (fbBody as any)?.error?.message || "Facebook API returned an error";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const toDate = (iso?: string | null): string => {
      if (!iso) return "";
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    };

    const toTime = (iso?: string | null): string => {
      if (!iso) return "";
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(11, 16);
    };

    const startDate = toDate(fbBody.start_time ?? null);
    const endDate = toDate(fbBody.end_time ?? fbBody.start_time ?? null);

    const normalized = {
      title: fbBody.name ?? "",
      description: fbBody.description ?? "",
      startDate,
      endDate,
      startTime: toTime(fbBody.start_time ?? null),
      endTime: toTime(fbBody.end_time ?? null),
      address: fbBody.place?.location?.street ?? "",
      place: fbBody.place?.name ?? "",
      town: fbBody.place?.location?.city ?? "",
      coverImageUrl: fbBody.cover?.source ?? null,
    };

    return NextResponse.json(normalized);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to import event from Facebook" },
      { status: 500 },
    );
  }
}
