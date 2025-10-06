import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

export type Event = Tables<"events">;
export type NewEvent = TablesInsert<"events">;
export type EventUpdate = TablesUpdate<"events">;

type ServiceResult<T> = {
  data: T;
  error: PostgrestError | null;
};

// MARK: Events

export async function getEvents(
  client: SupabaseClient
): Promise<ServiceResult<Event[]>> {
  const { data, error } = await client
    .from("events")
    .select("*")
    .order("startDateTime", { ascending: true });
  return { data: data ?? [], error };
}

export async function getEvent(
  client: SupabaseClient,
  id: number
): Promise<ServiceResult<Event | null>> {
  const { data, error } = await client
    .from("events")
    .select("*")
    .eq("id", id)
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
  return { data: data ?? null, error };
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
