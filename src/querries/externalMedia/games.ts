import { apiFetch } from "@/lib/http";
import { MediaItem, MediaTypeEnum } from "@/types/media";
import { toIsoDate } from "@/utils/date";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type IgdbScreenshot = {
  id: number;
  url: string;
};

export type IgdbArtwork = {
  id: number;
  url: string;
};

export type IgdbVideo = {
  id: number;
  name: string;
  videoId: string;
};

export type IgdbWebsite = {
  type: number;
  url: string;
};

export type IGDBGame = {
  id: number;
  slug: string;
  name: string;
  summary?: string | null;
  storyline?: string | null;
  firstReleaseDate?: string | null;
  rating?: number | null;
  totalRatingCount?: number | null;
  coverUrl: string;
  platforms?: Array<{ id: number; name: string; abbreviation?: string | null }>;
  genres?: Array<{ id: number; name: string }>;
  involvedCompanies?: Array<{
    companyId: number;
    companyName: string;
    developer: boolean;
    publisher: boolean;
  }>;
  screenshots?: IgdbScreenshot[];
  artworks?: IgdbArtwork[];
  videos?: IgdbVideo[];
  websites?: IgdbWebsite[];
};

type IGDBSearchItem = {
  id: number;
  name: string;
  coverUrl: string;
  firstReleaseDate?: string | null;
  summary?: string | null;
};

// ──────────────────────────────────────────────
// Cache
// ──────────────────────────────────────────────

const searchCache = new Map<string, { data: IGDBSearchItem[]; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

let searchController: AbortController | null = null;

// ──────────────────────────────────────────────
// Search
// ──────────────────────────────────────────────

export async function searchGamesNormalized(title: string, userId?: number): Promise<MediaItem[]> {
  const games = await searchGames(title, userId);

  return games.map((g) => ({
    id: g.id.toString(),
    title: g.name,
    coverUrl: g.coverUrl || "",
    year: toIsoDate(g.firstReleaseDate)?.slice(0, 4)
      ? Number(toIsoDate(g.firstReleaseDate)!.slice(0, 4))
      : undefined,
    releaseDate: toIsoDate(g.firstReleaseDate),
    type: MediaTypeEnum.GAME,
    description: g.summary || "",
    provider: "igdb",
    raw: g,
  }));
}

export async function searchGames(title: string, userId?: number): Promise<IGDBSearchItem[]> {
  if (!title || title.trim().length === 0) return [];

  const cacheKey = `${userId ?? "anon"}:${title.toLowerCase().trim()}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  if (searchController) {
    searchController.abort();
  }
  searchController = new AbortController();

  try {
    const params = userId !== undefined ? `?user_id=${userId}` : "";
    const results = await apiFetch<IGDBSearchItem[]>(
      `/api/igdb/games/search${params}`,
      {
        method: "POST",
        body: { query: title, limit: 20 },
        signal: searchController.signal,
      }
    );

    searchCache.set(cacheKey, { data: results, timestamp: Date.now() });
    if (searchCache.size > 100) {
      const oldestKey = searchCache.keys().next().value;
      searchCache.delete(oldestKey ?? "");
    }

    return results;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return [];
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// Details
// ──────────────────────────────────────────────

export async function getGameDetails(id: number, userId?: number): Promise<IGDBGame> {
  const params = userId !== undefined ? `?user_id=${userId}` : "";
  return apiFetch<IGDBGame>(`/api/igdb/games/${id}${params}`);
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

export function getPlatformNames(game: IGDBGame): string[] {
  return game.platforms?.map((p) => p.abbreviation || p.name) || [];
}

export function getPrimaryDeveloper(game: IGDBGame): string | undefined {
  return game.involvedCompanies?.find((c) => c.developer)?.companyName;
}

export function getPrimaryPublisher(game: IGDBGame): string | undefined {
  return game.involvedCompanies?.find((c) => c.publisher)?.companyName;
}
