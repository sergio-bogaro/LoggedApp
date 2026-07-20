/* eslint-disable @typescript-eslint/no-explicit-any */
import { searchKitsuPosters } from "@/querries/externalMedia/kitsu";
import { searchMangaCovers } from "@/querries/externalMedia/mangadex";
import { TMDBImage, tmdbPosterUrl } from "@/querries/externalMedia/movies";
import { MediaTypeEnum } from "@/types/media";

export type AlternativeImage = {
  url: string;
  label?: string;
  width?: number;
  height?: number;
};

// ──────────────────────────────────────────────
// TMDB — Movies
// ──────────────────────────────────────────────

function getMovieAlternatives(mediaData: any): AlternativeImage[] {
  const posters: TMDBImage[] = mediaData?.images?.posters || [];
  if (posters.length === 0) return [];

  return posters.map((p) => ({
    url: tmdbPosterUrl(p.file_path, "w342") || "",
    width: p.width,
    height: p.height,
    label: p.iso_639_1 || undefined,
  }));
}

// ──────────────────────────────────────────────
// RAWG — Games (direct fetch, no shared controller)
// ──────────────────────────────────────────────

const RAWG_BASE = "https://api.rawg.io/api";

async function getGameAlternatives(
  _mediaData: any,
  title: string,
): Promise<AlternativeImage[]> {
  if (!title) return [];

  const apiKey = import.meta.env.VITE_RAWG_API_KEY as string;
  if (!apiKey) return [];

  try {
    // Search RAWG for the game
    const searchParams = new URLSearchParams();
    searchParams.set("search", title);
    searchParams.set("page_size", "1");
    searchParams.set("key", apiKey);

    const searchRes = await fetch(
      `${RAWG_BASE}/games?${searchParams.toString()}`,
    );
    if (!searchRes.ok) return [];

    const searchData = await searchRes.json();
    const game = searchData.results?.[0];
    if (!game) return [];

    // Get screenshots for the found game
    const screenshotParams = new URLSearchParams();
    screenshotParams.set("key", apiKey);

    const screenshotRes = await fetch(
      `${RAWG_BASE}/games/${game.id}/screenshots?${screenshotParams.toString()}`,
    );
    if (!screenshotRes.ok) return [];

    const screenshotData = await screenshotRes.json();
    return (screenshotData.results || []).map((s: { image: string }) => ({
      url: s.image,
      label: "Screenshot",
    }));
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────
// OpenLibrary — Books
// ──────────────────────────────────────────────

function getBookAlternatives(mediaData: any): AlternativeImage[] {
  const coverIds: number[] = mediaData?.covers || [];
  if (coverIds.length === 0) return [];

  return coverIds.map((id) => ({
    url: `https://covers.openlibrary.org/b/id/${id}-M.jpg`,
    label: `Cover ${id}`,
  }));
}

// ──────────────────────────────────────────────
// AniList + Kitsu — Anime
// ──────────────────────────────────────────────

async function getAnimeAlternatives(
  mediaData: any,
  title: string,
): Promise<AlternativeImage[]> {
  const results: AlternativeImage[] = [];

  // Always include AniList cover variations
  const coverImage = mediaData?.coverImage;
  if (coverImage) {
    if (coverImage.extraLarge) {
      results.push({
        url: coverImage.extraLarge,
        label: "AniList (Extra Large)",
      });
    }
    if (coverImage.large) {
      results.push({ url: coverImage.large, label: "AniList (Large)" });
    }
  }

  // Fetch Kitsu posters for alternatives
  try {
    const kitsuPosters = await searchKitsuPosters(title, "anime");
    for (const p of kitsuPosters) {
      results.push({ url: p.url, label: `Kitsu — ${p.label}` });
    }
  } catch {
    // Silently fail — Kitsu is a secondary source
  }

  return results;
}

// ──────────────────────────────────────────────
// AniList + MangaDex — Manga
// ──────────────────────────────────────────────

async function getMangaAlternatives(
  mediaData: any,
  title: string,
): Promise<AlternativeImage[]> {
  const results: AlternativeImage[] = [];

  // Include AniList cover variations
  const coverImage = mediaData?.coverImage;
  if (coverImage) {
    if (coverImage.extraLarge) {
      results.push({
        url: coverImage.extraLarge,
        label: "AniList (Extra Large)",
      });
    }
    if (coverImage.large) {
      results.push({ url: coverImage.large, label: "AniList (Large)" });
    }
  }

  // Fetch MangaDex covers
  try {
    const mangaCovers = await searchMangaCovers(title);
    for (const c of mangaCovers) {
      results.push({ url: c.url, label: c.label });
    }
  } catch {
    // Silently fail — MangaDex is a secondary source
  }

  return results;
}

// ──────────────────────────────────────────────
// Dispatcher
// ──────────────────────────────────────────────

/**
 * Get alternative images for a media item based on its type.
 * Movies: instant (data already in mediaData)
 * Games/Anime/Manga: may make additional API calls to RAWG/Kitsu/MangaDex
 * Books: instant (data already in mediaData)
 */
export async function getAlternativeImages(
  mediaType: MediaTypeEnum,
  mediaData: unknown,
  title?: string,
): Promise<AlternativeImage[]> {
  const data = mediaData as any;

  switch (mediaType) {
    case MediaTypeEnum.MOVIES:
      return getMovieAlternatives(data);

    case MediaTypeEnum.GAME:
      return getGameAlternatives(data, title || data?.name || "");

    case MediaTypeEnum.BOOK:
      return getBookAlternatives(data);

    case MediaTypeEnum.ANIME:
      return getAnimeAlternatives(
        data,
        title || data?.title?.romaji || data?.title?.english || "",
      );

    case MediaTypeEnum.MANGA:
      return getMangaAlternatives(
        data,
        title || data?.title?.romaji || data?.title?.english || "",
      );

    default:
      return [];
  }
}
