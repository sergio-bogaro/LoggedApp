import { MediaItem } from "@/types/media";
import { MediaTypeEnum } from "@/types/media";

// Cache com localStorage (válido por 24 horas para economizar requisições)
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
const SEARCH_CACHE_KEY = "gamebrain_search_cache";
const DETAILS_CACHE_KEY = "gamebrain_details_cache";

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

// Funções auxiliares de cache
function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as CacheEntry<T>;
    if (Date.now() - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function saveToCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    // Ignorar erros de quota excedida
    console.warn("Cache storage error:", error);
  }
}

function getCacheKey(prefix: string, id: string | number): string {
  return `${prefix}_${id}`;
}

// GameBrain Types
export type GameBrainGame = {
  id: number;
  year?: number;
  name: string;
  genre?: string;
  image?: string;
  link: string;
  rating?: {
    mean: number;
    count: number;
    mean_players?: number;
    count_players?: number;
    mean_critics?: number | null;
    count_critics?: number;
  };
  adult_only?: boolean;
  screenshots?: string[];
  micro_trailer?: string;
  gameplay?: string;
  short_description?: string;
  description?: string;
  arcadia?: boolean;
  platforms?: Array<{
    value: string;
    name: string;
  }>;
  // Additional fields for detailed response
  x_url?: string;
  release_date?: string;
  developer?: string;
  playtime?: {
    percentiles: number[];
    min: number;
    max: number;
    mean: number;
    mentions: number;
    median: number;
  };
  tags?: Array<{
    value: string;
    name: string;
  }>;
  genres?: Array<{
    value: string;
    name: string;
  }>;
  themes?: Array<{
    value: string;
    name: string;
  }>;
  play_modes?: Array<{
    value: string;
    name: string;
  }>;
  videos?: string[];
  offers?: Array<{
    price: {
      value: number;
      currency: string;
    };
    store_name: string;
    platform: string;
    title: string;
    url: string;
  }>;
  official_stores?: Array<{
    source: string;
    url: string;
  }>;
};

export type GameBrainSearchResponse = {
  sorting?: {
    key: string | null;
    direction: string | null;
  };
  active_filter_options?: Array<{
    key: string;
    connection: string;
    values: Array<{
      match?: string;
      value: string;
    }>;
  }>;
  query: string;
  total_results: number;
  limit: number;
  offset: number;
  results: GameBrainGame[];
  filter_options?: Array<{
    name: string;
    key: string;
    values: Array<{
      name: string;
      key: string;
      count: number;
    }>;
    filter_type: string;
    filter_connection: string;
  }>;
  sorting_options?: Array<{
    name: string;
    sort: string;
    key: string;
  }>;
};

export type GameBrainFilter = {
  key: string;
  values: Array<{ value: string }>;
  connection?: "OR" | "AND" | "XOR";
};

const GAMEBRAIN_BASE = "https://api.gamebrain.co/v1";
const GAMEBRAIN_API_KEY = import.meta.env.VITE_GAMEBRAIN_API_KEY;

let searchController: AbortController | null = null;

// ============================================
// Search Functions
// ============================================

/**
 * Search games using GameBrain API
 * @param query Natural language search query
 * @param options Search options
 * @returns Search response with games and filters
 */
export async function searchGames(
  query: string,
  options?: {
    offset?: number;
    limit?: number;
    filters?: GameBrainFilter[];
    sort?: "computed_rating" | "price" | "release_date";
    sortOrder?: "asc" | "desc";
    generateFilterOptions?: boolean;
  }
): Promise<GameBrainSearchResponse> {
  if (!GAMEBRAIN_API_KEY) {
    throw new Error("GameBrain API key not configured");
  }

  if (!query || query.trim().length === 0) {
    return {
      query: "",
      total_results: 0,
      limit: 0,
      offset: 0,
      results: [],
    };
  }

  const cacheKey = getCacheKey(
    SEARCH_CACHE_KEY,
    `${query}-${JSON.stringify(options || {})}`
  );
  const cached = getFromCache<GameBrainGame[]>(cacheKey);
  if (cached) {
    return {
      query,
      total_results: cached.length,
      limit: options?.limit || 10,
      offset: options?.offset || 0,
      results: cached,
    };
  }

  if (searchController) {
    searchController.abort();
  }
  searchController = new AbortController();

  const params = new URLSearchParams();
  params.set("query", query);

  if (options?.offset !== undefined) {
    params.set("offset", options.offset.toString());
  }

  if (options?.limit !== undefined) {
    params.set("limit", Math.min(options.limit, 10).toString());
  }

  if (options?.filters && options.filters.length > 0) {
    params.set("filters", JSON.stringify(options.filters));
  }

  if (options?.sort) {
    params.set("sort", options.sort);
  }

  if (options?.sortOrder) {
    params.set("sort-order", options.sortOrder);
  }

  if (options?.generateFilterOptions !== undefined) {
    params.set("generate-filter-options", options.generateFilterOptions.toString());
  }

  try {
    const res = await fetch(`${GAMEBRAIN_BASE}/games?${params.toString()}`, {
      headers: {
        "x-api-key": GAMEBRAIN_API_KEY,
      },
      signal: searchController.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GameBrain API error: ${res.status} ${text}`);
    }

    const data: GameBrainSearchResponse = await res.json();

    // Cache results
    if (data.results && data.results.length > 0) {
      saveToCache(cacheKey, data.results);
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        query,
        total_results: 0,
        limit: 0,
        offset: 0,
        results: [],
      };
    }
    throw error;
  }
}

/**
 * Normalized search returning MediaItem[]
 */
export async function searchGamesNormalized(
  title: string,
  options?: {
    offset?: number;
    limit?: number;
    filters?: GameBrainFilter[];
    sort?: "computed_rating" | "price" | "release_date";
    sortOrder?: "asc" | "desc";
  }
): Promise<MediaItem[]> {
  const response = await searchGames(title, {
    ...options,
    generateFilterOptions: false,
  });

  return response.results.map((g) => ({
    id: g.id.toString(),
    title: g.name,
    coverUrl: g.image || undefined,
    year: g.year,
    type: MediaTypeEnum.GAME,
    description: g.short_description || "",
    provider: "gamebrain",
    raw: g,
  }));
}

// ============================================
// Details Functions
// ============================================

/**
 * Get game details by ID
 */
export async function getGameDetails(id: number): Promise<GameBrainGame> {
  if (!GAMEBRAIN_API_KEY) {
    throw new Error("GameBrain API key not configured");
  }

  // Check cache first
  const cacheKey = getCacheKey(DETAILS_CACHE_KEY, id);
  const cached = getFromCache<GameBrainGame>(cacheKey);
  if (cached) {
    return cached;
  }

  const res = await fetch(`${GAMEBRAIN_BASE}/games/${id}`, {
    headers: {
      "x-api-key": GAMEBRAIN_API_KEY,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GameBrain API error: ${res.status} ${text}`);
  }

  const game: GameBrainGame = await res.json();

  // Save to cache
  saveToCache(cacheKey, game);

  return game;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get game platforms as string array
 */
export function getPlatformNames(game: GameBrainGame): string[] {
  return game.platforms?.map((p) => p.name) || [];
}

/**
 * Get game rating as percentage (0-100)
 */
export function getRatingPercentage(game: GameBrainGame): number | undefined {
  if (!game.rating) return undefined;
  return game.rating.mean * 100;
}

/**
 * Get formatted rating display
 */
export function getRatingDisplay(game: GameBrainGame): string {
  if (!game.rating) return "N/A";
  const percentage = (game.rating.mean * 100).toFixed(0);
  return `${percentage}% (${game.rating.count.toLocaleString()} ratings)`;
}

/**
 * Check if game has screenshots
 */
export function hasScreenshots(game: GameBrainGame): boolean {
  return !!game.screenshots && game.screenshots.length > 0;
}

/**
 * Check if game has trailers
 */
export function hasTrailers(game: GameBrainGame): boolean {
  return !!game.micro_trailer || !!game.gameplay;
}

/**
 * Get all available media URLs
 */
export function getMediaUrls(game: GameBrainGame): {
  screenshots: string[];
  trailers: string[];
  videos: string[];
} {
  return {
    screenshots: game.screenshots || [],
    trailers: [game.micro_trailer, game.gameplay].filter(
      (url): url is string => !!url
    ),
    videos: game.videos || [],
  };
}

/**
 * Check if game is available on a specific platform
 */
export function isAvailableOnPlatform(
  game: GameBrainGame,
  platformValue: string
): boolean {
  return !!game.platforms?.some((p) => p.value === platformValue);
}

/**
 * Get game year or return current year
 */
export function getYearOrDefault(game: GameBrainGame): number {
  return game.year || new Date().getFullYear();
}

/**
 * Format game description (clean HTML if present)
 */
export function formatDescription(description?: string): string {
  if (!description) return "";
  return description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .trim();
}

/**
 * Get game display title (fallback to name)
 */
export function getDisplayTitle(game: GameBrainGame): string {
  return game.name || "Unknown Game";
}

/**
 * Get release year from release_date or year field
 */
export function getReleaseYear(game: GameBrainGame): number | undefined {
  if (game.release_date) {
    return new Date(game.release_date).getFullYear();
  }
  return game.year;
}

/**
 * Get all genres as string array
 */
export function getGenreNames(game: GameBrainGame): string[] {
  if (game.genres && game.genres.length > 0) {
    return game.genres.map((g) => g.name);
  }
  return game.genre ? [game.genre] : [];
}

/**
 * Get all tags as string array
 */
export function getTagNames(game: GameBrainGame): string[] {
  return game.tags?.map((t) => t.name) || [];
}

/**
 * Get all themes as string array
 */
export function getThemeNames(game: GameBrainGame): string[] {
  return game.themes?.map((t) => t.name) || [];
}

/**
 * Get all play modes as string array
 */
export function getPlayModeNames(game: GameBrainGame): string[] {
  return game.play_modes?.map((p) => p.name) || [];
}

/**
 * Get developer name
 */
export function getDeveloperName(game: GameBrainGame): string | undefined {
  return game.developer;
}

/**
 * Get formatted playtime information
 */
export function getPlaytimeInfo(game: GameBrainGame): string | undefined {
  if (!game.playtime) return undefined;
  const { mean, median, min, max } = game.playtime;
  return `${Math.round(mean)}h average (${min}-${max}h), ${median}h median`;
}

/**
 * Get lowest price offer
 */
export function getLowestPrice(game: GameBrainGame): {
  price: number;
  currency: string;
  store: string;
  url: string;
} | undefined {
  if (!game.offers || game.offers.length === 0) return undefined;

  const lowest = game.offers.reduce((min, offer) =>
    offer.price.value < min.price.value ? offer : min
  );

  return {
    price: lowest.price.value,
    currency: lowest.price.currency,
    store: lowest.store_name,
    url: lowest.url,
  };
}

/**
 * Check if game is free
 */
export function isFreeGame(game: GameBrainGame): boolean {
  return game.offers?.some((offer) => offer.price.value === 0) || false;
}

/**
 * Get all store links
 */
export function getStoreLinks(game: GameBrainGame): Array<{ name: string; url: string }> {
  return game.official_stores?.map((store) => ({
    name: store.source,
    url: store.url,
  })) || [];
}

/**
 * Check if game has multiplayer
 */
export function hasMultiplayer(game: GameBrainGame): boolean {
  return game.play_modes?.some((mode) =>
    mode.value.includes("multiplayer") ||
    mode.value.includes("co_op") ||
    mode.value.includes("pvp")
  ) || false;
}

/**
 * Get full description (fallback to short description)
 */
export function getDescription(game: GameBrainGame): string {
  return game.description || game.short_description || "";
}

/**
 * Clear all GameBrain caches
 */
export function clearCache() {
  try {
    // Clear all GameBrain cache entries
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(SEARCH_CACHE_KEY) || key.startsWith(DETAILS_CACHE_KEY)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("Error clearing cache:", error);
  }
}

/**
 * Clear only search cache
 */
export function clearSearchCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(SEARCH_CACHE_KEY)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("Error clearing search cache:", error);
  }
}

/**
 * Clear only details cache
 */
export function clearDetailsCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(DETAILS_CACHE_KEY)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("Error clearing details cache:", error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  try {
    const keys = Object.keys(localStorage);
    const searchKeys = keys.filter((k) => k.startsWith(SEARCH_CACHE_KEY));
    const detailsKeys = keys.filter((k) => k.startsWith(DETAILS_CACHE_KEY));

    return {
      searchCache: {
        count: searchKeys.length,
        size: searchKeys.reduce((acc, key) => {
          const item = localStorage.getItem(key);
          return acc + (item?.length || 0);
        }, 0),
      },
      detailsCache: {
        count: detailsKeys.length,
        size: detailsKeys.reduce((acc, key) => {
          const item = localStorage.getItem(key);
          return acc + (item?.length || 0);
        }, 0),
      },
      cacheDuration: CACHE_DURATION / (60 * 60 * 1000) + " hours",
    };
  } catch {
    return {
      searchCache: { count: 0, size: 0 },
      detailsCache: { count: 0, size: 0 },
      cacheDuration: "24 hours",
    };
  }
}

/**
 * Clean expired cache entries
 */
export function cleanExpiredCache() {
  try {
    const keys = Object.keys(localStorage);
    let cleaned = 0;

    keys.forEach((key) => {
      if (key.startsWith(SEARCH_CACHE_KEY) || key.startsWith(DETAILS_CACHE_KEY)) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const parsed = JSON.parse(item) as CacheEntry<unknown>;
            if (Date.now() - parsed.timestamp > CACHE_DURATION) {
              localStorage.removeItem(key);
              cleaned++;
            }
          } catch {
            // Remove invalid entries
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      }
    });

    return { cleaned };
  } catch (error) {
    console.warn("Error cleaning expired cache:", error);
    return { cleaned: 0 };
  }
}

// ============================================
// Advanced Search Helpers
// ============================================

/**
 * Create a platform filter
 */
export function createPlatformFilter(platforms: string[]): GameBrainFilter {
  return {
    key: "platform",
    values: platforms.map((p) => ({ value: p })),
    connection: "OR",
  };
}

/**
 * Create a genre filter
 */
export function createGenreFilter(genres: string[]): GameBrainFilter {
  return {
    key: "genre",
    values: genres.map((g) => ({ value: g })),
    connection: "OR",
  };
}

/**
 * Create a rating filter
 */
export function createRatingFilter(
  rating: "brilliant" | "amazing" | "great" | "good"
): GameBrainFilter {
  return {
    key: "review_rating",
    values: [{ value: rating }],
  };
}

/**
 * Create a price filter
 */
export function createPriceFilter(
  price: "free" | "under_5" | "under_15" | "under_25" | "under_40"
): GameBrainFilter {
  return {
    key: "price",
    values: [{ value: price }],
    connection: "XOR",
  };
}

/**
 * Create a release date filter
 */
export function createReleaseDateFilter(
  period: "last_month" | "last_year" | "last_5_years"
): GameBrainFilter {
  return {
    key: "release_date",
    values: [{ value: period }],
    connection: "XOR",
  };
}

/**
 * Search games with preset filters
 */
export async function searchWithPresets(
  query: string,
  preset: {
    platforms?: string[];
    genres?: string[];
    rating?: "brilliant" | "amazing" | "great" | "good";
    price?: "free" | "under_5" | "under_15" | "under_25" | "under_40";
    releaseDate?: "last_month" | "last_year" | "last_5_years";
  },
  options?: {
    offset?: number;
    limit?: number;
    sort?: "computed_rating" | "price" | "release_date";
    sortOrder?: "asc" | "desc";
  }
): Promise<GameBrainSearchResponse> {
  const filters: GameBrainFilter[] = [];

  if (preset.platforms && preset.platforms.length > 0) {
    filters.push(createPlatformFilter(preset.platforms));
  }

  if (preset.genres && preset.genres.length > 0) {
    filters.push(createGenreFilter(preset.genres));
  }

  if (preset.rating) {
    filters.push(createRatingFilter(preset.rating));
  }

  if (preset.price) {
    filters.push(createPriceFilter(preset.price));
  }

  if (preset.releaseDate) {
    filters.push(createReleaseDateFilter(preset.releaseDate));
  }

  return searchGames(query, {
    ...options,
    filters: filters.length > 0 ? filters : undefined,
  });
}
