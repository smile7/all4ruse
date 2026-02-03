"use client";

import { Facebook } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui";

type EventShareButtonProps = {
  url: string;
  title: string;
};

export function EventShareButton({ url, title }: EventShareButtonProps) {
  const t = useTranslations("HomePage");
  const label = t("shareOnFacebook");

  return (
    <Button asChild variant="outline">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
      >
        <Facebook className="size-4" />
        <span className="inline">{label}</span>
      </a>
    </Button>
  );
}
