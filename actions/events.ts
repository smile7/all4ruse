"use server";

import { redirect } from "next/navigation";

import { deleteEvent, type EventUpdate, updateEvent } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { getString } from "@/lib/utils";

import { uploadImage } from "./common";

export async function createEventAction(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title");
  const description = formData.get("description");
  const startDateTime = formData.get("startDateTime");
  const endDateTime = formData.get("endDateTime");

  let image: string | null = null;
  const file = formData.get("image") as File | null;

  if (file && file.size > 0) {
    const uploaded = await uploadImage(supabase, file);
    2;
    image = uploaded.url;
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      description,
      startDateTime,
      endDateTime,
      image,
    })
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  console.log(data);

  redirect("/");
}

export async function updateEventAction(id: number, formData: FormData) {
  const supabase = await createClient();

  let image: string | undefined;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    const uploaded = await uploadImage(supabase, file);
    image = uploaded.url;
  }

  const patch: EventUpdate = {
    title: getString(formData, "title"),
    startDateTime: getString(formData, "startDateTime"),
    endDateTime: getString(formData, "endDateTime"),
    description: getString(formData, "description"),
    ...(image ? { image } : {}),
  };

  const { data, error } = await updateEvent(supabase, id, patch);
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteEventAction(id: number) {
  const supabase = await createClient();
  const { data, error } = await deleteEvent(supabase, id);
  if (error) throw new Error(error.message);
  return data;
}
