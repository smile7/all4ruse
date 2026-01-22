"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";

export type EventTagsMap = Record<number, number[]>;

export function useEventTagsMap(eventIds: number[]) {
  const supabase = createClient();

  const uniqueSortedIds = Array.from(new Set(eventIds)).sort((a, b) => a - b);

  return useQuery({
    queryKey: ["event-tags", uniqueSortedIds],
    queryFn: async (): Promise<EventTagsMap> => {
      if (!uniqueSortedIds.length) return {};

      const { data, error } = await supabase
        .from("event_tags")
        .select("event_id, tag_id")
        .in("event_id", uniqueSortedIds);

      if (error) throw error;

      const map: EventTagsMap = {};
      for (const row of data ?? []) {
        const eventId = (row as { event_id: number }).event_id;
        const tagId = (row as { tag_id: number }).tag_id;
        if (!map[eventId]) map[eventId] = [];
        map[eventId].push(tagId);
      }
      return map;
    },
    enabled: uniqueSortedIds.length > 0,
  });
}
