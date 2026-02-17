import { MediaItem } from "@/types/media";
import { MediaTypeEnum } from "@/types/media";

// Cache simples em memória (válido por 10 minutos)
const searchCache = new Map<string, { data: RAWGGame[]; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

// Normalized search returning MediaItem[]
export async function searchGamesNormalized(title: string): Promise<MediaItem[]> {
  const games = await searchGames(title);

  return games.map((g) => ({
    id: g.id.toString(),
    title: g.name,
    coverUrl: g.background_image || undefined,
    year: g.released ? new Date(g.released).getFullYear() : undefined,
    releaseDate: g.released,
    type: MediaTypeEnum.GAME,
    description: g.description_raw || "",
    provider: "rawg",
    raw: g,
  }));
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export type RAWGGame = {
  id: number;
  slug: string;
  name: string;
  name_original?: string;
  description?: string;
  description_raw?: string;
  metacritic?: number;
  metacritic_platforms?: Array<{
    metascore: number;
    url: string;
    platform: {
      platform: number;
      name: string;
      slug: string;
    };
  }>;
  released?: string;
  tba?: boolean;
  updated?: string;
  background_image?: string | null;
  background_image_additional?: string | null;
  website?: string;
  rating?: number;
  rating_top?: number;
  ratings?: Array<{
    id: number;
    title: string;
    count: number;
    percent: number;
  }>;
  reactions?: Record<string, number>;
  added?: number;
  added_by_status?: {
    yet?: number;
    owned?: number;
    beaten?: number;
    toplay?: number;
    dropped?: number;
    playing?: number;
  };
  playtime?: number;
  screenshots_count?: number;
  movies_count?: number;
  creators_count?: number;
  achievements_count?: number;
  parent_achievements_count?: number;
  reddit_url?: string;
  reddit_name?: string;
  reddit_description?: string;
  reddit_logo?: string;
  reddit_count?: number;
  twitch_count?: number;
  youtube_count?: number;
  reviews_text_count?: number;
  ratings_count?: number;
  suggestions_count?: number;
  alternative_names?: string[];
  metacritic_url?: string;
  parents_count?: number;
  additions_count?: number;
  game_series_count?: number;
  user_game?: any;
  reviews_count?: number;
  saturated_color?: string;
  dominant_color?: string;
  parent_platforms?: Array<{
    platform: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  platforms?: Array<{
    platform: {
      id: number;
      name: string;
      slug: string;
      image?: string | null;
      year_end?: number | null;
      year_start?: number | null;
      games_count?: number;
      image_background?: string;
    };
    released_at?: string;
    requirements?: {
      minimum?: string;
      recommended?: string;
    };
  }>;
  stores?: Array<{
    id: number;
    url: string;
    store: {
      id: number;
      name: string;
      slug: string;
      domain?: string;
      games_count?: number;
      image_background?: string;
    };
  }>;
  developers?: Array<{
    id: number;
    name: string;
    slug: string;
    games_count?: number;
    image_background?: string;
  }>;
  genres?: Array<{
    id: number;
    name: string;
    slug: string;
    games_count?: number;
    image_background?: string;
  }>;
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
    language?: string;
    games_count?: number;
    image_background?: string;
  }>;
  publishers?: Array<{
    id: number;
    name: string;
    slug: string;
    games_count?: number;
    image_background?: string;
  }>;
  esrb_rating?: {
    id: number;
    name: string;
    slug: string;
    name_en?: string;
    name_ru?: string;
  };
  clip?: any;
  short_screenshots?: Array<{
    id: number;
    image: string;
  }>;
};

export type RAWGScreenshot = {
  id: number;
  image: string;
  width: number;
  height: number;
  is_deleted: boolean;
};

export type RAWGTrailer = {
  id: number;
  name: string;
  preview: string;
  data: {
    480?: string;
    max?: string;
  };
};

const RAWG_BASE = "https://api.rawg.io/api";
const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY;

let searchController: AbortController | null = null;

export async function searchGames(title: string): Promise<RAWGGame[]> {
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

  const params = new URLSearchParams();
  params.set("search", title);
  params.set("page_size", "20");
  params.set("key", RAWG_API_KEY);

  try {
    const res = await fetch(`${RAWG_BASE}/games?${params.toString()}`, {
      signal: searchController.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`RAWG API error: ${res.status} ${text}`);
    }

    const data = await res.json();
    const results: RAWGGame[] = data.results || [];

    searchCache.set(cacheKey, { data: results, timestamp: Date.now() });

    if (searchCache.size > 100) {
      const oldestKey = searchCache.keys().next().value;
      searchCache.delete(oldestKey);
    }

    return results;
  } catch (error: any) {
    if (error.name === "AbortError") {
      return [];
    }
    throw error;
  }
}

export async function getGameDetails(id: number): Promise<RAWGGame> {
  const params = new URLSearchParams();
  params.set("key", RAWG_API_KEY);

  const res = await fetch(`${RAWG_BASE}/games/${id}?${params.toString()}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RAWG details error: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getGameScreenshots(id: number): Promise<RAWGScreenshot[]> {
  const params = new URLSearchParams();
  params.set("key", RAWG_API_KEY);

  const res = await fetch(`${RAWG_BASE}/games/${id}/screenshots?${params.toString()}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RAWG screenshots error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.results || [];
}

export async function getGameTrailers(id: number): Promise<RAWGTrailer[]> {
  const params = new URLSearchParams();
  params.set("key", RAWG_API_KEY);

  const res = await fetch(`${RAWG_BASE}/games/${id}/movies?${params.toString()}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RAWG trailers error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.results || [];
}

export async function getGameSeries(id: number): Promise<RAWGGame[]> {
  const params = new URLSearchParams();
  params.set("key", RAWG_API_KEY);

  const res = await fetch(`${RAWG_BASE}/games/${id}/game-series?${params.toString()}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RAWG game series error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.results || [];
}

export async function getSimilarGames(id: number): Promise<RAWGGame[]> {
  const params = new URLSearchParams();
  params.set("key", RAWG_API_KEY);

  const res = await fetch(`${RAWG_BASE}/games/${id}/suggested?${params.toString()}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RAWG similar games error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.results || [];
}

export async function getDLCs(id: number): Promise<RAWGGame[]> {
  const params = new URLSearchParams();
  params.set("key", RAWG_API_KEY);

  const res = await fetch(`${RAWG_BASE}/games/${id}/additions?${params.toString()}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RAWG DLCs error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.results || [];
}

export async function getGamesByPlatform(
  platformId: number,
  page: number = 1
): Promise<RAWGGame[]> {
  const params = new URLSearchParams();
  params.set("platforms", platformId.toString());
  params.set("page", page.toString());
  params.set("page_size", "20");
  params.set("key", RAWG_API_KEY);

  const res = await fetch(`${RAWG_BASE}/games?${params.toString()}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RAWG platform games error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.results || [];
}

export async function getGamesByGenre(genreId: number, page: number = 1): Promise<RAWGGame[]> {
  const params = new URLSearchParams();
  params.set("genres", genreId.toString());
  params.set("page", page.toString());
  params.set("page_size", "20");
  params.set("key", RAWG_API_KEY);

  const res = await fetch(`${RAWG_BASE}/games?${params.toString()}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RAWG genre games error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.results || [];
}

export async function getGamesByDateRange(
  startDate: string,
  endDate: string,
  page: number = 1
): Promise<RAWGGame[]> {
  const params = new URLSearchParams();
  params.set("dates", `${startDate},${endDate}`);
  params.set("page", page.toString());
  params.set("page_size", "20");
  params.set("ordering", "-released");
  params.set("key", RAWG_API_KEY);

  const res = await fetch(`${RAWG_BASE}/games?${params.toString()}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RAWG date range error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.results || [];
}

export function getPrimaryDeveloper(game: RAWGGame): string | undefined {
  return game.developers?.[0]?.name;
}

export function getPrimaryPublisher(game: RAWGGame): string | undefined {
  return game.publishers?.[0]?.name;
}

export function getPlatformNames(game: RAWGGame): string[] {
  return game.platforms?.map((p) => p.platform.name) || [];
}

export function getGenreNames(game: RAWGGame): string[] {
  return game.genres?.map((g) => g.name) || [];
}

export function getStoreLinks(game: RAWGGame): Array<{ name: string; url: string }> {
  return (
    game.stores?.map((s) => ({
      name: s.store.name,
      url: s.url,
    })) || []
  );
}

export function getSystemRequirements(game: RAWGGame): {
  platform: string;
  minimum?: string;
  recommended?: string;
}[] {
  return (
    game.platforms
      ?.filter((p) => p.requirements?.minimum || p.requirements?.recommended)
      .map((p) => ({
        platform: p.platform.name,
        minimum: p.requirements?.minimum,
        recommended: p.requirements?.recommended,
      })) || []
  );
}

export function getMetacriticScore(game: RAWGGame): number | undefined {
  return game.metacritic;
}

export function getRatingPercentage(game: RAWGGame): number | undefined {
  if (!game.rating || !game.rating_top) return undefined;
  return (game.rating / game.rating_top) * 100;
}

export function clearRAWGCache() {
  searchCache.clear();
}

export function cleanDescription(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .trim();
}