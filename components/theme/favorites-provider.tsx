"use client";

import { createContext, useContext, useEffect, useMemo } from "react";

import { useLocalStorage } from "@/hooks";
import { useCookieConsent } from "@/components/CookieConsentProvider";

export type FavoriteItem = {
  id: number;
  name: string;
  url: string;
  emoji: string;
};

type FavoritesContextValue = {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "all4ruse:favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [storedFavorites, setStoredFavorites] = useLocalStorage<FavoriteItem[]>(
    STORAGE_KEY,
    [],
  );

  const { consent } = useCookieConsent();
  const isAllowed = consent === "all";

  useEffect(() => {
    if (consent === "necessary" && storedFavorites.length > 0) {
      setStoredFavorites([]);
    }
  }, [consent, storedFavorites.length, setStoredFavorites]);

  const favorites = isAllowed ? storedFavorites : [];

  const toggleFavorite = (item: FavoriteItem) => {
    if (!isAllowed) return;

    setStoredFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === item.id);
      if (exists) {
        return prev.filter((fav) => fav.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const removeFavorite = (id: number) => {
    if (!isAllowed) return;

    setStoredFavorites((prev) => prev.filter((fav) => fav.id !== id));
  };

  const isFavorite = (id: number) =>
    isAllowed && favorites.some((fav) => fav.id === id);

  const value = useMemo(
    () => ({ favorites, toggleFavorite, removeFavorite, isFavorite }),
    [favorites],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
