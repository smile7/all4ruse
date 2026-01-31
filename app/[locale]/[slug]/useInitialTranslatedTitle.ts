import { useSearchParams } from "next/navigation";

export function useInitialTranslatedTitle(fallback: string) {
  const searchParams = useSearchParams();
  return searchParams.get("translatedTitle") || fallback;
}
