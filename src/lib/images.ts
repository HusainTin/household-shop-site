/**
 * The sheet's image cells can hold:
 *  - a Google Drive share link (https://drive.google.com/file/d/<id>/view…)
 *  - any direct image URL (Cloudinary, ImageKit, …)
 *  - a filename inside /public/images (e.g. WB001.jpg)
 *
 * Drive resizes on its side via the size parameter, so we don't need Next's
 * image optimiser (and avoid its hosting quotas).
 */
export function driveFileId(src: string): string | null {
  if (!/(drive|docs)\.google\.com/.test(src)) return null;
  const m = src.match(/\/d\/([\w-]{10,})/) ?? src.match(/[?&]id=([\w-]{10,})/);
  return m ? m[1] : null;
}

/** URLs to try in order; later entries are fallbacks if the first fails to load. */
export function imageSources(src: string | undefined, width: number): string[] {
  if (!src) return [];
  const id = driveFileId(src);
  if (id) {
    return [
      `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`,
      `https://lh3.googleusercontent.com/d/${id}=w${width}`,
    ];
  }
  if (/^https?:\/\//i.test(src)) return [src];
  return [`/images/${src.replace(/^\/+/, "")}`];
}
