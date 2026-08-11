// lib/image-upload.ts
// Upload images to Supabase Storage instead of base64 in localStorage

import { createClient, isSupabaseConfigured } from "@/lib/supabase";

const BUCKET_NAME = "organization-images";

/**
 * Convert base64 data URL to File object
 */
function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Upload image to Supabase Storage
 * @param dataUrl Base64 data URL or regular URL
 * @param folder Folder path: "banners", "backgrounds", "feedback", "certificates"
 * @returns Public URL string or null on failure
 */
export async function uploadImageToStorage(
  dataUrl: string,
  folder: "banners" | "backgrounds" | "feedback" | "certificates"
): Promise<string | null> {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, falling back to localStorage");
    return dataUrl; // fallback
  }

  // If already a URL (not base64), return as-is
  if (!dataUrl.startsWith("data:image")) {
    return dataUrl;
  }

  const supabase = createClient();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const filePath = `${folder}/${filename}`;

  try {
    const file = dataURLtoFile(dataUrl, filename);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[uploadImageToStorage] Upload error:", uploadError.code, uploadError.message);
      return dataUrl; // fallback to base64
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error("Failed to upload image:", err);
    return dataUrl; // fallback
  }
}

/**
 * Upload multiple images to Supabase Storage
 */
export async function uploadImagesToStorage(
  images: { id: string; imageUrl: string; [key: string]: any }[],
  folder: "feedback" | "certificates"
): Promise<{ id: string; imageUrl: string }[]> {
  const results: { id: string; imageUrl: string }[] = [];

  for (const img of images) {
    if (img.imageUrl.startsWith("data:image")) {
      const url = await uploadImageToStorage(img.imageUrl, folder);
      if (url) {
        results.push({ id: img.id, imageUrl: url });
      } else {
        results.push({ id: img.id, imageUrl: img.imageUrl }); // keep original
      }
    } else {
      results.push({ id: img.id, imageUrl: img.imageUrl }); // already a URL
    }
  }

  return results;
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImageFromStorage(
  url: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !url.includes(BUCKET_NAME)) {
    return false;
  }

  try {
    const supabase = createClient();
    const path = url.split(`${BUCKET_NAME}/`)[1];
    if (!path) return false;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    return !error;
  } catch {
    return false;
  }
}
