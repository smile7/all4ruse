"use client";

import { Heart } from "lucide-react";

import { useState } from "react";

import { Button } from "@/components/ui";
import { useFavorites } from "@/components/theme";
import { useCookieConsent } from "@/components/CookieConsentProvider";
import { DrawerDialog } from "@/components/DialogDrawer";
import { useTranslations } from "next-intl";

type FavoriteButtonProps = {
  id: number;
  name: string;
  url?: string;
};

export function FavoriteButton({ id, name, url }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { consent, acceptAll, acceptNecessary } = useCookieConsent();
  const isFav = isFavorite(id);
  const t = useTranslations("General");
  const [open, setOpen] = useState(false);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (consent !== "all") {
      setOpen(true);
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
    <>
      <Button
        type="button"
        variant={isFav ? "default" : "outline"}
        size="icon"
        aria-pressed={isFav}
        aria-label={isFav ? t("removeFromFavorites") : t("addToFavorites")}
        title={isFav ? t("removeFromFavorites") : t("addToFavorites")}
        onClick={handleClick}
      >
        <Heart className={isFav ? "fill-current" : ""} />
      </Button>
      <DrawerDialog
        open={open}
        setOpen={setOpen}
        title={t("cookies")}
        description={t("favoritesAvailability")}
      >
        <div className="px-6 pb-4 flex flex-col gap-3">
          <div className="flex flex-col w-full md:flex-row justify-end gap-4 mt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                acceptNecessary();
                setOpen(false);
              }}
            >
              {t("onlyNecessary")}
            </Button>
            <Button
              variant="default"
              size="sm"
              type="button"
              onClick={() => {
                acceptAll();
                setOpen(false);

                const finalUrl =
                  url ??
                  (typeof window !== "undefined"
                    ? window.location.pathname
                    : "/");

                toggleFavorite({
                  id,
                  name,
                  url: finalUrl,
                  emoji: "⭐️",
                });
              }}
            >
              {t("acceptCookies")}
            </Button>
          </div>
        </div>
      </DrawerDialog>
    </>
  );
}
