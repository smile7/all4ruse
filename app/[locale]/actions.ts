import { SupabaseClient } from "@supabase/supabase-js";

import { EVENTS_BUCKET } from "@/constants";
import { compressImageToWebp } from "@/lib/imageCompression";

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function validateAndUploadEventImageClient(
  supabase: SupabaseClient,
  file?: File,
  folder = "events",
  bucket = EVENTS_BUCKET,
): Promise<string | undefined> {
  if (!file || file.size === 0) return;
  if (file.size > MAX_BYTES)
    throw new Error("Файлът е твърде голям (макс. 10MB).");
  if (!ALLOWED_MIME.includes(file.type))
    throw new Error("Неподдържан тип изображение.");

  // Compress and convert to WebP on the client before upload
  const compressed = await compressImageToWebp(file);

  const ext =
    compressed.type === "image/webp"
      ? "webp"
      : compressed.name.split(".").pop() || "bin";

  const path = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, compressed, {
      // Aggressive caching: 1 year (images are content-addressed via unique path)
      cacheControl: "31536000",
      upsert: false,
      contentType: compressed.type,
    });
  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}
