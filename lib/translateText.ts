// Utility function to translate text using the internal API route
export async function translateText(text: string, target: string) {
  // Map app locale codes to external API language codes when needed
  // Google Translate uses "uk" for Ukrainian, while the app uses "ua"
  const apiTarget = target === "ua" ? "uk" : target;
  const origin =
    typeof window === "undefined"
      ? (process.env.NEXT_PUBLIC_SITE_URL ??
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"))
      : "";
  const endpoint =
    typeof window === "undefined"
      ? new URL("/api/translate", origin).toString()
      : "/api/translate";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target: apiTarget }),
  });
  const data = await res.json();
  if (data?.data?.translations?.[0]?.translatedText) {
    return data.data.translations[0].translatedText;
  }
  throw new Error("Translation failed");
}
