"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DEBOUNCE_MS } from "@/constants";

import { useDebounce } from "./useDebounce";

type Filters = {
  title: string;
  from: string | null;
  to: string | null;
};

export function useEventFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [title, setTitle] = useState(() => searchParams.get("title") || "");
  const [from, setFrom] = useState<string | null>(() =>
    searchParams.get("from"),
  );
  const [to, setTo] = useState<string | null>(() => searchParams.get("to"));
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const debouncedTitle = useDebounce(title, DEBOUNCE_MS);
  const lastAppliedQSRef = useRef<string | null>(null);

  // build query string
  useEffect(() => {
    const nextQS = buildStringQuery({ title: debouncedTitle, from, to });
    if (lastAppliedQSRef.current === nextQS) return;
    lastAppliedQSRef.current = nextQS;
    router.replace(`${pathname}${nextQS}`, { scroll: false });
  }, [debouncedTitle, from, to, router, pathname]);

  // sync state when URL changes externally (back/forward/manual-edit)
  useEffect(() => {
    const currentQS = `?${searchParams.toString()}`;
    if (lastAppliedQSRef.current === currentQS) return;
    const parsed = parseFromSearch(searchParams);
    setTitle(parsed.title);
    setFrom(parsed.from);
    setTo(parsed.to);
    lastAppliedQSRef.current = currentQS;
  }, [searchParams]);

  const clear = useCallback(() => {
    setTitle("");
    setFrom(null);
    setTo(null);
    setTagIds([]);
    setFreeOnly(false);
    lastAppliedQSRef.current = "";
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const hasFilters = Boolean(
    title.trim() || from || to || tagIds.length || freeOnly,
  );
  const appliedFiltersCount = [
    title.trim(),
    from,
    to,
    tagIds.length ? "tags" : "",
    freeOnly ? "free" : "",
  ].filter(Boolean).length;

  return {
    title,
    setTitle,
    from,
    setFrom,
    to,
    setTo,
    tagIds,
    setTagIds,
    freeOnly,
    setFreeOnly,
    hasFilters,
    appliedFiltersCount,
    clear,
  };
}

function parseFromSearch(searchParams: URLSearchParams) {
  return {
    title: searchParams.get("title") || "",
    from: searchParams.get("from"),
    to: searchParams.get("to"),
  };
}

function buildStringQuery({ title, from, to }: Filters) {
  const params = new URLSearchParams();
  if (title.trim()) params.set("title", title.trim());
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const s = params.toString();
  return s ? `?${s}` : "";
}
