/* Photos people add (gallery, team, services, before and after). Until there is file storage they live in
   this browser, so each one is scaled down to a JPEG first: a phone photo of several MB becomes ~100 KB. */

export const PHOTO_TYPES = "image/jpeg,image/png,image/webp";
const MAX_INPUT = 15 * 1024 * 1024;

export class PhotoError extends Error {
  constructor(public reason: "type" | "size" | "unreadable") {
    super(reason);
  }
}

/** Reads an image file and returns a JPEG data URL no wider or taller than `max` pixels. */
export async function readPhoto(file: File, max = 1200): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new PhotoError("type");
  if (file.size > MAX_INPUT) throw new PhotoError("size");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new PhotoError("unreadable"));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}
