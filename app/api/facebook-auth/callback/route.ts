import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Facebook OAuth redirect handler.
// Exchanges the `code` for an access token and stores it
// in the current user's profile (profiles.fb).

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  const redirectUrl = new URL("/", request.url);

  if (error) {
    redirectUrl.searchParams.set("fbAuthError", error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    redirectUrl.searchParams.set("fbAuthError", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    redirectUrl.searchParams.set("fbAuthError", "server_not_configured");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      client_secret: appSecret,
      code,
    });

    const tokenRes = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?${params.toString()}`,
    );

    const tokenBody = (await tokenRes.json().catch(() => null)) as {
      access_token?: string;
      token_type?: string;
      expires_in?: number;
    } | null;

    if (!tokenRes.ok || !tokenBody?.access_token) {
      const msg = (tokenBody as any)?.error?.message ?? "token_exchange_failed";
      redirectUrl.searchParams.set("fbAuthError", msg);
      return NextResponse.redirect(redirectUrl);
    }

    const accessToken = tokenBody.access_token;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirectUrl.searchParams.set("fbAuthError", "no_user");
      return NextResponse.redirect(redirectUrl);
    }

    // Store the access token in the user's profile.
    // Reuses the existing `fb` column; later you can create
    // a dedicated column (e.g. fb_access_token) if desired.
    await supabase
      .from("profiles")
      .update({ fb: accessToken })
      .eq("id", user.id);

    redirectUrl.searchParams.set("fbAuth", "success");
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    redirectUrl.searchParams.set("fbAuthError", "unexpected_error");
    return NextResponse.redirect(redirectUrl);
  }
}
