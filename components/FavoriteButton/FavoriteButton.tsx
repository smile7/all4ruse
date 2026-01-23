"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui";
import { useFavorites } from "@/components/theme";

type FavoriteButtonProps = {
  id: number;
  name: string;
  url?: string;
};

export function FavoriteButton({ id, name, url }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(id);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();

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
