export function capitalizeFirstLetter(string : string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

/*
 * Reduces third-party rich text to plain text.
 *
 * TMDB sends plain prose; AniList sends light HTML (`<br>`, the occasional
 * `<i>`/`<b>`). Rather than render foreign markup through
 * `dangerouslySetInnerHTML`, everything is flattened: block ends become
 * newlines, every tag is dropped, and only then are entities decoded.
 *
 * The order matters — decoding first would turn `&lt;script&gt;` into real
 * markup before the tags were stripped.
 */
export function htmlToPlainText(value?: string | null): string {
  if (!value) return "";

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, "\"")
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
