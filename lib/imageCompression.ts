export async function compressImageToWebp(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {},
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const { maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = options;

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = imageUrl;
    });

    const { width, height } = image;
    if (!width || !height) return file;

    const scale = Math.min(1, maxWidth / width, maxHeight / height);
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) return reject(new Error("Failed to compress image"));
          resolve(b);
        },
        "image/webp",
        quality,
      );
    });

    const originalName = file.name;
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const newName = `${baseName}.webp`;

    return new File([blob], newName, { type: blob.type });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
