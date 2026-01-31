// Utility function to translate text using the internal API route
export async function translateText(text: string, target: string) {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target }),
  });
  const data = await res.json();
  if (data?.data?.translations?.[0]?.translatedText) {
    return data.data.translations[0].translatedText;
  }
  throw new Error("Translation failed");
}
