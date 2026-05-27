import { NextResponse } from "next/server";

import {
  aiEventDraftRequestSchema,
  aiEventDraftSchema,
} from "@/lib/ai-event-draft";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_MODEL =
  process.env.AI_EVENT_DRAFT_MODEL || "gemini-2.5-flash-lite";

function getLanguageName(locale: string) {
  switch (locale) {
    case "bg":
      return "Bulgarian";
    case "ro":
      return "Romanian";
    case "ua":
      return "Ukrainian";
    default:
      return "English";
  }
}

function getApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    ""
  );
}

function buildPrompt({
  prompt,
  generateDescription,
  locale,
  availableTags,
  hasImage,
}: {
  prompt: string;
  generateDescription: boolean;
  locale: string;
  availableTags: string[];
  hasImage: boolean;
}) {
  const languageName = getLanguageName(locale);
  const today = new Date().toISOString().slice(0, 10);
  const tagList = availableTags.length > 0 ? availableTags.join(", ") : "none";

  return [
    "You extract event draft data for an event creation form.",
    `Today is ${today}.`,
    `Write title and description in ${languageName}.`,
    hasImage
      ? "An event poster, flyer, or screenshot may be attached. Extract only facts that are clearly visible in the image."
      : null,
    "Use only facts that are explicitly present or strongly implied in the user's text.",
    "If a field is missing or unclear, return an empty string or an empty array.",
    "Do not invent images or image URLs.",
    "Dates must use YYYY-MM-DD.",
    "Times must use HH:MM in 24-hour format.",
    "If the event is a single-day event, set endDate equal to startDate.",
    "If an end time is missing, leave endTime empty.",
    "Return organizers as an array of objects with name and link.",
    `Use only tags from this list: ${tagList}. If none match, return [].`,
    generateDescription
      ? [
          "Generate a short plain-text event description in 1 to 3 paragraphs.",
          "Write like a careful local event editor, not like ad copy.",
          "Keep the tone natural, specific, and grounded in the provided facts.",
          "Prefer concrete details over generic filler.",
          "Vary sentence length and structure so the text feels naturally written.",
          "Avoid keyword stuffing, cliches, exaggerated claims, and generic AI-style phrases such as 'don't miss', 'something for everyone', 'immerse yourself', or 'join us for an unforgettable experience'.",
          "If the source details are limited, keep the description brief instead of padding it.",
          "Do not use markdown or HTML.",
        ].join(" ")
      : "Set description to an empty string.",
    "Return JSON only with these keys: title, description, address, place, town, startDate, startTime, endDate, endTime, organizers, ticketsLink, fbLink, email, price, phoneNumber, tagSuggestions.",
    prompt === "" ? "User input: none" : "User input:",
    prompt === "" ? null : prompt,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => ({}));
    const parsedBody = aiEventDraftRequestSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Missing or invalid AI draft input." },
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

    const apiKey = getApiKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Gemini API key." },
        { status: 500 },
      );
    }

    const payload = parsedBody.data;
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: buildPrompt({
              ...payload,
              hasImage: Boolean(payload.image),
            }),
          },
          ...(payload.image
            ? [
                {
                  inlineData: {
                    mimeType: payload.image.mimeType,
                    data: payload.image.data,
                  },
                },
              ]
            : []),
        ],
      },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "Return clean JSON only. Never wrap the response in markdown code fences.",
              },
            ],
          },
          contents,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        responseBody?.error?.message || "AI event draft request failed.";

      return NextResponse.json({ error: message }, { status: 502 });
    }

    const text = responseBody?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "AI response did not include draft data." },
        { status: 502 },
      );
    }

    const parsedDraft = aiEventDraftSchema.safeParse(JSON.parse(text));

    if (!parsedDraft.success) {
      return NextResponse.json(
        { error: "AI response could not be parsed into event fields." },
        { status: 502 },
      );
    }

    return NextResponse.json(parsedDraft.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate AI event draft." },
      { status: 500 },
    );
  }
}
