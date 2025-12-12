import type {
  AuthError,
  PostgrestError,
  SupabaseClient,
} from "@supabase/supabase-js";

import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

// MARK: Events

export type Event = Tables<"events">;
export type CreateNewEvent = TablesInsert<"events">;
export type EventUpdate = TablesUpdate<"events">;

type ServiceResult<T> = {
  data: T;
  error: PostgrestError | AuthError | null;
};

export type Host = {
  name: string;
  link?: string;
};
export type EventRow = Omit<Tables<"events">, "organizers"> & {
  organizers: Host[];
};

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
  payload: CreateNewEvent
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

// Mark: Profiles

export type Profile = Tables<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

export async function getProfileById(
  client: SupabaseClient,
  id: string
): Promise<ServiceResult<Profile | null>> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return { data: data ?? null, error };
}

export async function getCurrentUserProfile(client: SupabaseClient): Promise<
  ServiceResult<
    | (Profile & {
        email?: string | null;
      })
    | null
  >
> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    return { data: null, error: userError };
  }
  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      data: profile ? { ...profile, email: user.email ?? null } : null,
      error: profileError,
    };
  }

  return {
    data: { ...profile, email: user.email ?? null },
    error: null,
  };
}

export async function updateCurrentUserProfile(
  client: SupabaseClient,
  patch: ProfileUpdate
): Promise<ServiceResult<Profile | null>> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    return { data: null, error: userError };
  }
  const { data, error } = await client
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select("*")
    .maybeSingle();

  return { data: data ?? null, error };
}
