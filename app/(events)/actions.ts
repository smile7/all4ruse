"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { SupabaseClient } from "@supabase/supabase-js";

import { createEventSchema } from "@/lib/schema";
import { createClient } from "@/lib/supabase/server";

export type CreateEventActionState = { error: string | null };

export async function createEventAction(
  _prev: CreateEventActionState,
  formData: FormData
): Promise<CreateEventActionState> {
  try {
    const supabase = await createClient();

    const raw: Record<string, unknown> = {};
    for (const [k, v] of formData.entries()) raw[k] = v;
    if (!raw.isFree) raw.isFree = false;

    const parsed = createEventSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message || "Невалидни данни",
      };
    }

    const file = formData.get("image") as File | null;
    const image = await validateAndUploadEventImage(supabase, file);

    const { error } = await supabase.from("events").insert({
      ...parsed.data,
      image: image,
    });

    if (error) return { error: error.message };

    redirect("/");
    return { error: null };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return {
      error:
        err instanceof Error
          ? err.message
          : "Възникна неочаквана грешка. Опитайте отново.",
    };
  }
}

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function validateAndUploadEventImage(
  supabase: SupabaseClient,
  file: File | null
): Promise<string | undefined> {
  if (!file || file.size === 0) return;

  if (file.size > MAX_BYTES)
    throw new Error("Файлът е твърде голям (макс. 10MB).");
  if (!ALLOWED_MIME.includes(file.type))
    throw new Error("Неподдържан тип изображение.");

  const uploaded = await uploadImage(supabase, file);
  return uploaded.url;
}

export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  folder = "events",
  bucket = "event-images"
) {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) throw new Error(error.message);
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: publicUrl, path };
}
