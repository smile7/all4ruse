"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DEBOUNCE_MS } from "@/constants";
import { useTags } from "@/hooks/query";
import type { Tag } from "@/lib/api";
import { slugify } from "@/lib/utils";

import { useDebounce } from "./useDebounce";

type Filters = {
  title: string;
  from: string | null;
  to: string | null;
  tagIds: number[];
  freeOnly: boolean;
  place?: string;
  host?: string;
};

export function useEventFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: allTags = [] } = useTags();

  const initial = parseFromSearch(searchParams as URLSearchParams, allTags);

  const [title, setTitle] = useState(initial.title);
  const [from, setFrom] = useState<string | null>(initial.from);
  const [to, setTo] = useState<string | null>(initial.to);
  const [tagIds, setTagIds] = useState<number[]>(initial.tagIds);
  const [freeOnly, setFreeOnly] = useState(initial.freeOnly);
  const [place, setPlace] = useState<string | undefined>(
    initial.place ?? undefined,
  );
  const [host, setHost] = useState<string | undefined>(
    initial.host ?? undefined,
  );

  const debouncedTitle = useDebounce(title, DEBOUNCE_MS);
  const lastAppliedQSRef = useRef<string | null>(null);
  const initializedFromUrlRef = useRef(false);

  // Initialize filter state from URL once, when tags metadata is available.
  useEffect(() => {
    if (initializedFromUrlRef.current) return;
    if (!allTags.length) return;

    const parsed = parseFromSearch(searchParams as URLSearchParams, allTags);
    setTitle(parsed.title);
    setFrom(parsed.from);
    setTo(parsed.to);
    setTagIds(parsed.tagIds);
    setFreeOnly(parsed.freeOnly);
    setPlace(parsed.place ?? undefined);
    setHost(parsed.host ?? undefined);
    initializedFromUrlRef.current = true;
  }, [searchParams, allTags]);

  // Build query string from local state and push it into the URL
  useEffect(() => {
    // Avoid clobbering existing tag slugs before tags metadata is loaded
    if (!allTags.length && (searchParams as URLSearchParams).get("tags")) {
      return;
    }

    const nextQS = buildStringQuery(
      {
        title: debouncedTitle,
        from,
        to,
        tagIds,
        freeOnly,
        place,
        host,
      },
      allTags,
    );

    if (lastAppliedQSRef.current === nextQS) return;
    lastAppliedQSRef.current = nextQS;

    const url = nextQS ? `${pathname}?${nextQS}` : pathname;
    router.replace(url, { scroll: false });
  }, [
    debouncedTitle,
    from,
    to,
    tagIds,
    freeOnly,
    allTags,
    router,
    pathname,
    searchParams,
  ]);

  const clear = useCallback(() => {
    setTitle("");
    setFrom(null);
    setTo(null);
    setTagIds([]);
    setFreeOnly(false);
    setPlace(undefined);
    setHost(undefined);
    lastAppliedQSRef.current = "";
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const hasFilters = Boolean(
    title.trim() ||
      from ||
      to ||
      tagIds.length ||
      freeOnly ||
      (place && place.trim()) ||
      (host && host.trim()),
  );
  const appliedFiltersCount =
    (title.trim() ? 1 : 0) +
    (from ? 1 : 0) +
    (to ? 1 : 0) +
    tagIds.length +
    (freeOnly ? 1 : 0) +
    (place && place.trim() ? 1 : 0) +
    (host && host.trim() ? 1 : 0);

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
    place,
    setPlace,
    host,
    setHost,
    hasFilters,
    appliedFiltersCount,
    clear,
  };
}

function parseFromSearch(searchParams: URLSearchParams, allTags: Tag[]) {
  const tagsParam = searchParams.get("tags");
  let tagIds: number[] = [];

  if (tagsParam && allTags.length) {
    const slugs = tagsParam
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (slugs.length) {
      const bySlug = new Map<string, number>();
      for (const tag of allTags) {
        const rawTitle = tag.title ?? "";
        if (!rawTitle) continue;
        const s = slugify(rawTitle);
        if (!s) continue;
        if (!bySlug.has(s)) {
          bySlug.set(s, tag.id);
        }
      }

      tagIds = slugs
        .map((slug) => bySlug.get(slug))
        .filter((id): id is number => typeof id === "number");
    }
  }

  const freeOnly = searchParams.get("free") === "1";
  const place = searchParams.get("place") || null;
  const host = searchParams.get("host") || null;

  return {
    title: searchParams.get("title") || "",
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    tagIds,
    freeOnly,
    place,
    host,
  };
}

function buildStringQuery(
  { title, from, to, tagIds, freeOnly, place, host }: Filters,
  allTags: Tag[],
) {
  const params = new URLSearchParams();
  if (title.trim()) params.set("title", title.trim());
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (tagIds.length && allTags.length) {
    const byId = new Map<number, string>();
    for (const tag of allTags) {
      const rawTitle = tag.title ?? "";
      if (!rawTitle) continue;
      const s = slugify(rawTitle);
      if (!s) continue;
      if (!byId.has(tag.id)) {
        byId.set(tag.id, s);
      }
    }

    const slugs = tagIds
      .map((id) => byId.get(id))
      .filter((slug): slug is string => typeof slug === "string");

    if (slugs.length) {
      const unique = Array.from(new Set(slugs));
      params.set("tags", unique.join(","));
    }
  }
  if (freeOnly) params.set("free", "1");
  if (place && place.trim()) params.set("place", place.trim());
  if (host && host.trim()) params.set("host", host.trim());
  const s = params.toString();
  return s;
}
