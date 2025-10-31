"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server"; // ✅ import translations
import { SupabaseClient } from "@supabase/supabase-js";

import { BUCKET } from "@/constants";
import { createEventSchema } from "@/lib/schema";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export type CreateEventActionState = { error: string | null };

export async function createEventAction(
  _prev: CreateEventActionState,
  formData: FormData
): Promise<CreateEventActionState> {
  try {
    const t = await getTranslations("CreateEvent");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Моля влезте в профила си." };

    const raw: Record<string, unknown> = {};
    for (const [k, v] of formData.entries()) {
      if (k === "organizers") {
        raw[k] = JSON.parse(v as string);
      } else {
        raw[k] = v;
      }
    }
    const parsed = createEventSchema(t).safeParse(raw);
    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message || "Невалидни данни",
      };
    }

    const file = formData.get("image") as File | null;
    const image = await validateAndUploadEventImage(supabase, file);

    const slug = slugify(parsed.data.title);

    const { error } = await supabase.from("events").insert({
      ...parsed.data,
      image: image,
      slug,
    });

    if (error) return { error: error.message };

    redirect("/");
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

// ----------------- image handling -----------------
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
  bucket = BUCKET
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
