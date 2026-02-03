import { useMemo } from "react";

import type { Event, Tag } from "@/lib/api";
import { toTimestamp } from "@/lib/utils";
import { useTags } from "@/hooks/query";
import { TAG_LABELS_BG } from "@/constants";

type BasicFilters = {
  title: string;
  from: string | null;
  to: string | null;
  tagIds: number[];
  freeOnly: boolean;
};

export function useFilteredEvents(
  events: Event[],
  filters: BasicFilters,
  eventTags?: Record<number, number[]>,
) {
  const { title, from, to, tagIds, freeOnly } = filters;
  const { data: allTags = [] } = useTags();

  const tagsById = useMemo(() => {
    const map = new Map<number, Tag>();
    for (const tag of allTags) {
      map.set(tag.id, tag);
    }
    return map;
  }, [allTags]);

  const normalizeTagSearchTokens = (tag: Tag): string[] => {
    const raw = (tag.title ?? "").trim();
    if (!raw) return [];

    const base = raw.toUpperCase();

    // Find canonical key: either the English code key or the key
    // whose Bulgarian label matches the stored title.
    let canonical = base;
    if (Object.prototype.hasOwnProperty.call(TAG_LABELS_BG, base)) {
      canonical = base;
    } else {
      const entry = Object.entries(TAG_LABELS_BG).find(
        ([, bgLabel]) => bgLabel.toUpperCase() === base,
      );
      if (entry) {
        canonical = entry[0];
      }
    }

    const tokens = new Set<string>();

    // English-style code (e.g. "COMEDY")
    tokens.add(canonical.toLowerCase());

    // English human label (e.g. "Comedy")
    const englishPretty = canonical
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    tokens.add(englishPretty.toLowerCase());

    // Bulgarian label if available
    const bgLabel = TAG_LABELS_BG[canonical];
    if (bgLabel) {
      tokens.add(bgLabel.toLowerCase());
    }

    // Raw stored title as a fallback
    tokens.add(raw.toLowerCase());

    return Array.from(tokens);
  };

  const filteredEvents = useMemo(() => {
    const query = title.trim().toLowerCase();
    const fromTs = from ? toTimestamp(from) : null;
    const toTs = to ? toTimestamp(to + "T23:59:59") : null;

    return events
      .filter((e) => {
        if (query) {
          const t = (e.title ?? "").toLowerCase();
          let matches = t.includes(query);

          // Also allow matching by tag labels (both EN/BG variants)
          if (!matches && eventTags && tagsById.size) {
            const tagsForEvent = eventTags[e.id as number] ?? [];
            for (const tagId of tagsForEvent) {
              const tag = tagsById.get(tagId);
              if (!tag) continue;
              const tokens = normalizeTagSearchTokens(tag);
              if (tokens.some((token) => token.includes(query))) {
                matches = true;
                break;
              }
            }
          }

          if (!matches) return false;
        }
        if (fromTs || toTs) {
          const start = toTimestamp(e.startDate);
          if (fromTs && start && start < fromTs) return false;
          if (toTs && start && start > toTs) return false;
        }
        if (freeOnly) {
          const price = (e.price ?? "").trim();
          if (price !== "0") return false;
        }
        if (tagIds.length && eventTags) {
          const tagsForEvent = eventTags[e.id as number] ?? [];
          if (!tagsForEvent.length) return false;
          const hasMatch = tagsForEvent.some((id) => tagIds.includes(id));
          if (!hasMatch) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aT = toTimestamp(a.startDate);
        const bT = toTimestamp(b.startDate);
        if (aT === bT) return 0;
        if (aT === null) return 1;
        if (bT === null) return -1;
        return aT - bT;
      });
  }, [
    events,
    title,
    from,
    to,
    tagIds,
    eventTags,
    tagsById,
    normalizeTagSearchTokens,
  ]);

  return {
    filteredEvents,
  };
}
