"use client";
import { useState } from "react";
import { translateText } from "@/lib/translateText";
import { Typography } from "@/components/Typography";

interface EventDescriptionProps {
  description: string;
  locale: string;
}

export default function EventDescription({
  description,
  locale,
}: EventDescriptionProps) {
  const [translated, setTranslated] = useState<{
    description: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    setLoading(true);
    setError(null);
    try {
      const translatedDescription = await translateText(description, locale);
      setTranslated({
        description: translatedDescription,
      });
    } catch (e) {
      setError("Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {locale !== "bg" && !translated && (
        <button
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          onClick={handleTranslate}
          disabled={loading}
        >
          {loading ? "Translating..." : "Translate"}
        </button>
      )}
      {error && <div className="text-red-500">{error}</div>}
      <div
        className="whitespace-pre-wrap text-pretty minimal-tiptap-editor"
        dangerouslySetInnerHTML={{
          __html: translated ? translated.description : description,
        }}
      />
    </div>
  );
}
