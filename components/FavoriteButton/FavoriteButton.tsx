"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui";
import { useFavorites } from "@/components/theme";
import { useCookieConsent } from "@/components/CookieConsentProvider";
import { useTranslations } from "next-intl";

type FavoriteButtonProps = {
  id: number;
  name: string;
  url?: string;
};

export function FavoriteButton({ id, name, url }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { consent } = useCookieConsent();
  const isFav = isFavorite(id);
  const t = useTranslations("General");

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (consent !== "all") {
      toast.info(t("favoritesAvailability"));
      return;
    }

    const finalUrl =
      url ?? (typeof window !== "undefined" ? window.location.pathname : "/");

    toggleFavorite({
      id,
      name,
      url: finalUrl,
      emoji: "⭐️",
    });
  };

  return (
    <Button
      type="button"
      variant={isFav ? "default" : "outline"}
      size="icon"
      aria-pressed={isFav}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      onClick={handleClick}
    >
      <Heart className={isFav ? "fill-current" : ""} />
    </Button>
  );
}
