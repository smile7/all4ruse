import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

export type Event = Tables<"events">;
export type NewEvent = TablesInsert<"events">;
export type EventUpdate = TablesUpdate<"events">;

type ServiceResult<T> = {
  data: T;
  error: PostgrestError | null;
};

export type Host = {
  name: string;
  link?: string;
};
export type EventRow = Omit<Tables<"events">, "organizers"> & {
  organizers: Host[];
};

// MARK: Events
export async function getEvents(
  client: SupabaseClient
): Promise<ServiceResult<Event[]>> {
  const { data, error } = await client
    .from("events")
    .select("*")
    .order("startDate", { ascending: true });

  return { data: data ?? [], error };
}

export async function getEventBySlug(
  client: SupabaseClient,
  slug: string
): Promise<ServiceResult<EventRow | null>> {
  const { data, error } = await client
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return { data: data ?? null, error };
}

export async function createEvent(
  client: SupabaseClient,
  payload: NewEvent
): Promise<ServiceResult<Event | null>> {
  const { data, error } = await client
    .from("events")
    .insert(payload)
    .select("*")
    .maybeSingle();

  if (data && Array.isArray(data.organizers)) {
    return {
      data: { ...data, organizers: data.organizers as Host[] },
      error,
    };
  }

  return { data: data as EventRow | null, error };
}

export async function updateEvent(
  client: SupabaseClient,
  id: number,
  patch: EventUpdate
): Promise<ServiceResult<Event | null>> {
  const { data, error } = await client
    .from("events")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  return { data: data ?? null, error };
}

export async function deleteEvent(
  client: SupabaseClient,
  id: number
): Promise<ServiceResult<boolean>> {
  const { error } = await client.from("events").delete().eq("id", id);

  return { data: !error, error };
}
