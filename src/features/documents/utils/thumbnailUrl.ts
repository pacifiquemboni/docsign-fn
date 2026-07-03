/**
 * Convert the filesystem thumbnail_path from the API into a browser-accessible
 * URL served by the backend's /thumbnails static mount.
 *
 * The backend stores absolute paths like:
 *   D:\Files\...\storage\thumbnails\abcdef01\<uuid>.png
 *
 * The Vite dev proxy maps /thumbnails → http://127.0.0.1:8000/thumbnails
 */
export function getThumbnailUrl(thumbnailPath: string | null | undefined): string | null {
  if (!thumbnailPath) return null;
  const normalized = thumbnailPath.replace(/\\/g, '/');
  const match = normalized.match(/thumbnails\/(.+)$/);
  return match ? `/thumbnails/${match[1]}` : null;
}
