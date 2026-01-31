import { useEffect, useState } from "react";
import { translateText } from "@/lib/translateText";

interface Event {
  id: string | number;
  title: string;
  [key: string]: any;
}

interface TranslatedTitles {
  [id: string]: string;
}

export function useTranslatedTitles(
  events: Event[],
  locale: string,
): TranslatedTitles {
  const [translatedTitles, setTranslatedTitles] = useState<TranslatedTitles>(
    {},
  );
  useEffect(() => {
    let isMounted = true;
    async function translateAll() {
      if (locale === "bg") return;
      const results: [string | number, string][] = await Promise.all(
        events.map((e) =>
          translateText(e.title, locale)
            .then((t: string) => [e.id, t] as [string | number, string])
            .catch(() => [e.id, e.title] as [string | number, string]),
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
