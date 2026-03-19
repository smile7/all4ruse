import { NextResponse } from "next/server";

// Simple endpoint that builds the Facebook OAuth URL and returns it to the client

export async function GET() {
  const appId = process.env.FACEBOOK_APP_ID;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: "Facebook auth is not configured on the server" },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: "public_profile",
    response_type: "code",
  });

  const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;

  return NextResponse.json({ url: authUrl });
}
