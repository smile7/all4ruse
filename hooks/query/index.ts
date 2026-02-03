"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import {
  createEvent,
  type CreateNewEvent,
  deleteEvent,
  type Event,
  type EventUpdate,
  getCurrentUserProfile,
  getEventBySlug,
  getEvents,
  getTags,
  type Profile,
  updateCurrentUserProfile,
  updateEvent,
  type Tag,
} from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

// -------------------- Profile --------------------

export type ProfileFormValues = {
  full_name: string;
  email: string;
  username: string;
  website?: string;
};

const profileQueryKeys = {
  all: () => ["profile"] as const,
};

export function useProfile() {
  const supabase = createClient();

  return useQuery({
    queryKey: profileQueryKeys.all(),
    queryFn: async () => {
      const { data, error } = await getCurrentUserProfile(supabase);

      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const t = useTranslations("General");

  return useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { error } = await updateCurrentUserProfile(supabase, {
        full_name: values.full_name || null,
        email: values.email || null,
        username: values.username || null,
        website: values.website || null,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("profileUpdatedSuccessfully"));
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.all(),
      });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("General");

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/delete-account", {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.error || "Failed to delete account";
        throw new Error(message);
      }

      return true as const;
    },
    onSuccess: async () => {
      const supabase = createClient();
      await supabase.auth.signOut();

      toast.success(t("accountDeletedSuccessfully"));
      queryClient.clear();
      router.replace(`/${locale}`);
      router.refresh();
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error?.message ?? "Failed to delete account");
    },
  });
}

// -------------------- Events --------------------

const eventQueryKeys = {
  all: () => ["events"] as const,
  list: () => [...eventQueryKeys.all(), "list"] as const,
  bySlug: (slug: string) => [...eventQueryKeys.all(), "by-slug", slug] as const,
  byId: (id: number | string) =>
    [...eventQueryKeys.all(), "by-id", String(id)] as const,
};

export function useEvents() {
  const supabase = createClient();

  return useQuery({
    queryKey: eventQueryKeys.list(),
    queryFn: async (): Promise<Event[]> => {
      // Fetch all events (active and pending) for the user events page
      const { data, error } = await getEvents(supabase, { all: true });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// -------------------- Tags --------------------

const tagQueryKeys = {
  all: () => ["tags"] as const,
  list: () => [...tagQueryKeys.all(), "list"] as const,
};

export function useTags() {
  const supabase = createClient();

  return useQuery({
    queryKey: tagQueryKeys.list(),
    queryFn: async (): Promise<Tag[]> => {
      const { data: tags, error } = await getTags(supabase);
      if (error) throw error;

      const { data: usageRows, error: usageError } = await supabase
        .from("event_tags")
        .select("tag_id");

      if (usageError) throw usageError;

      const counts = new Map<number, number>();
      for (const row of usageRows ?? []) {
        const tagId = (row as { tag_id: number }).tag_id;
        counts.set(tagId, (counts.get(tagId) ?? 0) + 1);
      }

      return [...(tags ?? [])].sort((a, b) => {
        const countA = counts.get(a.id) ?? 0;
        const countB = counts.get(b.id) ?? 0;
        if (countA !== countB) return countB - countA;
        const titleA = (a.title ?? "").toUpperCase();
        const titleB = (b.title ?? "").toUpperCase();
        return titleA.localeCompare(titleB);
      });
    },
  });
}

export function useEvent(slug: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: eventQueryKeys.bySlug(slug),
    queryFn: async () => {
      // Fetch event regardless of isEventActive for editing
      const { data, error } = await getEventBySlug(supabase, slug, {
        all: true,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateEvent() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const t = useTranslations("General");

  return useMutation({
    mutationFn: async (body: CreateNewEvent) => {
      const result = await createEvent(supabase, body);
      if (result.error) {
        throw result.error;
      }
      return result;
    },
    onSuccess: (result) => {
      const createdEvent = (
        result as { data?: { isEventActive?: boolean } | null }
      ).data;
      const isActive = createdEvent?.isEventActive === true;

      toast.success(
        t(
          isActive
            ? "eventCreatedSuccessfullyActive"
            : "eventCreatedSuccessfully",
        ),
      );
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.list(),
      });
    },
    onError: (error) => {
      console.error("Error creating event", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.list(),
      });
    },
  });
}

export function useUpdateEvent() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const t = useTranslations("General");

  return useMutation({
    mutationFn: async ({
      id,
      slug,
      patch,
    }: {
      id: number;
      slug: string;
      patch: EventUpdate;
    }) => {
      const { data, error } = await updateEvent(supabase, id, patch);
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { id, slug }) => {
      toast.success(t("eventUpdatedSuccessfully"));
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.list(),
      });
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.byId(id),
      });
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.bySlug(slug),
      });
    },
  });
}

export function useDeleteEvent() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const t = useTranslations("General");

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await deleteEvent(supabase, id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success(t("eventDeletedSuccessfully"));
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.list(),
      });
    },
  });
}

// -------------------- Auth (basic examples) --------------------

export function useSignInWithPassword() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async (params: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword(params);
      if (error) throw error;
      return data;
    },
  });
}

export function useSignOut() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  });
}
