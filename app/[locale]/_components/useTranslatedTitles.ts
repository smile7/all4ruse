import { useEffect, useState } from "react";
import { translateText } from "@/lib/translateText";

export function useTranslatedTitles(events, locale) {
  const [translatedTitles, setTranslatedTitles] = useState({});
  useEffect(() => {
    let isMounted = true;
    async function translateAll() {
      if (locale === "bg") return;
      const results = await Promise.all(
        events.map((e) =>
          translateText(e.title, locale)
            .then((t) => [e.id, t])
            .catch(() => [e.id, e.title]),
        ),
      );
      if (isMounted) {
        setTranslatedTitles(Object.fromEntries(results));
      }
    }
    translateAll();
    return () => {
      isMounted = false;
    };
  }, [events, locale]);
  return translatedTitles;
}
