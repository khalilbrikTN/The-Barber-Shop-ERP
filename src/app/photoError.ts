import { PhotoError } from "../lib/photo";
import type { TextKey } from "./i18n";

/** The staff-facing message for a photo that could not be added. */
export function photoMessage(e: unknown): TextKey {
  const reason = e instanceof PhotoError ? e.reason : "unreadable";
  return reason === "type" ? "web.photoErrType" : reason === "size" ? "web.photoErrSize" : "web.photoErrRead";
}
