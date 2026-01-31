import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, target } = await req.json();
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Google Translate API key." },
      { status: 500 },
    );
  }

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        target,
        format: "text",
      }),
    },
  );

  const data = await response.json();
  return NextResponse.json(data);
}
