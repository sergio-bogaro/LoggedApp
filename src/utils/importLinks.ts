import type { ImportCandidate, ImportEntry } from "@/types/import";
import { MediaTypeEnum } from "@/types/media";

/*
 * External links for the import review screen. There are two sides to compare:
 *  - the metadata candidate the app matched against (TMDB / AniList / OpenLibrary);
 *  - the original source entry from the export (IMDb / Trakt / MyAnimeList / …).
 * When the source file carries no id, we fall back to a search on that platform
 * so the user always has something to open next to the match.
 */

const TMDB_BASE = "https://www.themoviedb.org";
const ANILIST_BASE = "https://anilist.co";

function tmdbUrl(mediaType: MediaTypeEnum, id: string): string {
  return `${TMDB_BASE}/${mediaType === MediaTypeEnum.SERIES ? "tv" : "movie"}/${id}`;
}

function anilistUrl(mediaType: MediaTypeEnum, id: string): string {
  return `${ANILIST_BASE}/${mediaType === MediaTypeEnum.MANGA ? "manga" : "anime"}/${id}`;
}

function anilistSearchUrl(mediaType: MediaTypeEnum, title: string): string {
  return `${ANILIST_BASE}/search/${mediaType === MediaTypeEnum.MANGA ? "manga" : "anime"}?search=${title}`;
}

function myAnimeListUrl(mediaType: MediaTypeEnum, id: string): string {
  return `https://myanimelist.net/${mediaType === MediaTypeEnum.MANGA ? "manga" : "anime"}/${id}`;
}

/** Link externo do candidato de metadata (o que o Logged encontrou). */
export function metadataUrl(candidate: ImportCandidate): string | null {
  switch (candidate.provider) {
    case "tmdb":
      return tmdbUrl(candidate.mediaType, candidate.externalId);
    case "anilist":
      return anilistUrl(candidate.mediaType, candidate.externalId);
    case "openlibrary":
      return `https://openlibrary.org/works/${candidate.externalId}`;
    default:
      return null;
  }
}

/** Chave de tradução do nome do provedor de metadata (namespace `import`). */
export function metadataProviderKey(provider: string): string {
  return `metadata.${provider}`;
}

/** Link externo da entrada original do export (o que deveria ser). */
export function sourceUrl(entry: ImportEntry): string | null {
  const refs = entry.externalRefs ?? {};
  const title = encodeURIComponent(entry.title);

  switch (entry.source) {
    case "imdb":
      return refs.imdbId
        ? `https://www.imdb.com/title/${refs.imdbId}/`
        : `https://www.imdb.com/find/?q=${title}`;
    case "trakt":
      if (refs.traktSlug) {
        return `https://trakt.tv/${entry.mediaType === MediaTypeEnum.SERIES ? "shows" : "movies"}/${refs.traktSlug}`;
      }
      if (refs.tmdbId) return tmdbUrl(entry.mediaType, refs.tmdbId);
      if (refs.imdbId) return `https://www.imdb.com/title/${refs.imdbId}/`;
      return `https://trakt.tv/search?query=${title}`;
    case "anilist":
      return refs.anilistId
        ? anilistUrl(entry.mediaType, refs.anilistId)
        : anilistSearchUrl(entry.mediaType, title);
    case "mal":
      return refs.malId
        ? myAnimeListUrl(entry.mediaType, refs.malId)
        : `https://myanimelist.net/search/all?q=${title}`;
    case "goodreads": {
      const isbn = refs.isbn13 ?? refs.isbn10;
      return isbn
        ? `https://www.goodreads.com/book/isbn/${isbn}`
        : `https://www.goodreads.com/search?q=${title}`;
    }
    case "letterboxd":
      return refs.letterboxdUri ?? `https://letterboxd.com/search/${title}/`;
    default:
      return null;
  }
}
