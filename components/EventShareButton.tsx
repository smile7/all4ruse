"use client";

import { Facebook } from "lucide-react";

import { Button } from "@/components/ui";

type EventShareButtonProps = {
  url: string;
  title: string;
};

export function EventShareButton({ url, title }: EventShareButtonProps) {
  const handleClick = () => {
    const targetUrl =
      typeof window !== "undefined" && window.location?.href
        ? window.location.href
        : url;

    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      targetUrl,
    )}&quote=${encodeURIComponent(title)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button asChild variant="outline" size="sm">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Share</span>
      </a>
    </Button>
  );
}
