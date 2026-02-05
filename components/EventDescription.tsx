"use client";
import { useState } from "react";
import { translateText } from "@/lib/translateText";
import { Typography } from "@/components/Typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useTranslations } from "next-intl";

interface EventDescriptionProps {
  description: string;
  locale: string;
}

export default function EventDescription({
  description,
  locale,
}: EventDescriptionProps) {
  const t = useTranslations("SingleEvent");
  const [translated, setTranslated] = useState<{
    description: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<"" | "en" | "ro" | "ua">("");

  const handleChangeTarget = async (value: string) => {
    const nextTarget = value as "en" | "ro" | "ua";
    setTarget(nextTarget);
    setLoading(true);
    setError(null);
    try {
      const translatedDescription = await translateText(
        description,
        nextTarget,
      );
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
      {locale !== "bg" && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Typography.Small className="text-muted-foreground">
            {t("translate")}
          </Typography.Small>
          <div className="w-full max-w-xs">
            <Select
              value={target}
              onValueChange={handleChangeTarget}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("chooseLanguage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ro">Română</SelectItem>
                <SelectItem value="ua">Українська</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      {error && <div className="text-destructive">{error}</div>}
      <div
        className="whitespace-pre-wrap text-pretty minimal-tiptap-viewer"
        dangerouslySetInnerHTML={{
          __html: translated ? translated.description : description,
        }}
      />
    </div>
  );
}
