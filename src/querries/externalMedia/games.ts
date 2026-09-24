import { API_BASE_URL } from "@/querries/apiBase";
import { MediaItem, MediaTypeEnum } from "@/types/media";

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

export async function searchGamesNormalized(title: string): Promise<MediaItem[]> {
  const games = await searchGames(title);

  return games.map((g) => ({
    id: g.id.toString(),
    title: g.name,
    coverUrl: g.coverUrl || "",
    year: g.firstReleaseDate
      ? new Date(g.firstReleaseDate).getFullYear()
      : undefined,
    releaseDate: g.firstReleaseDate || undefined,
    type: MediaTypeEnum.GAME,
    description: g.summary || "",
    provider: "igdb",
    raw: g,
  }));
}

export async function searchGames(title: string): Promise<IGDBSearchItem[]> {
  if (!title || title.trim().length === 0) return [];

  const cacheKey = title.toLowerCase().trim();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  if (searchController) {
    searchController.abort();
  }
  searchController = new AbortController();

  try {
    const res = await fetch(`${API_BASE_URL}/api/igdb/games/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: title, limit: 20 }),
      signal: searchController.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`IGDB search error: ${res.status} ${text}`);
    }

    const results: IGDBSearchItem[] = await res.json();

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

export async function getGameDetails(id: number): Promise<IGDBGame> {
  const res = await fetch(`${API_BASE_URL}/api/igdb/games/${id}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IGDB details error: ${res.status} ${text}`);
  }

  return res.json();
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
