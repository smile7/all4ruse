"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createEvent,
  type CreateNewEvent,
  deleteEvent,
  type Event,
  type EventUpdate,
  getCurrentUserProfile,
  getEventBySlug,
  getEvents,
  updateCurrentUserProfile,
  updateEvent,
} from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

// -------------------- Profile --------------------

export type ProfileFormValues = {
  full_name: string;
  email: string;
  username: string;
  website: string;
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

  return useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { error } = await updateCurrentUserProfile(supabase, {
        full_name: values.full_name || null,
        username: values.username || null,
        website: values.website || null,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.all(),
      });
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
      const { data, error } = await getEvents(supabase);
      if (error) throw error;
      return data;
    },
  });
}

export function useEvent(slug: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: eventQueryKeys.bySlug(slug),
    queryFn: async () => {
      const { data, error } = await getEventBySlug(supabase, slug);
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useCreateEvent() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateNewEvent) => {
      return await createEvent(supabase, body);
      //   const { data, error } = await createEvent(supabase, body);
      //   if (error) throw error;
      //   return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.list(),
      });
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

  return useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: EventUpdate }) => {
      const { data, error } = await updateEvent(supabase, id, patch);
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.list(),
      });
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.byId(id),
      });
    },
  });
}

export function useDeleteEvent() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await deleteEvent(supabase, id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
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
