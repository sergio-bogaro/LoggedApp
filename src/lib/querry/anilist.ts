import { MediaItem } from "@/types/mediaItem";
import { MediaTypeEnum } from "@/utils/mediaText";

// Cache simples em memória (válido por 10 minutos)
const searchCache = new Map<string, { data: AniListMedia[]; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

// Normalized search returning MediaItem[]
export async function searchMangaAnilistNormalized(title: string): Promise<MediaItem[]> {
  const mangas = await searchAniList(title, "MANGA");

  return mangas.map((m) => ({
    id: m.id.toString(),
    title: m.title.english || m.title.romaji || m.title.native || "",
    coverUrl: m.coverImage.large || m.coverImage.medium,
    year: m.seasonYear || m.startDate?.year,
    type: MediaTypeEnum.MANGA,
    description: m.description || "",
    provider: "anilist",
    raw: m,
  }));
}

export async function searchAnimeAnilistNormalized(title: string): Promise<MediaItem[]> {
  const animes = await searchAniList(title, "ANIME");

  return animes.map((a) => ({
    id: a.id.toString(),
    title: a.title.english || a.title.romaji || a.title.native || "",
    coverUrl: a.coverImage.large || a.coverImage.medium,
    year: a.seasonYear || a.startDate?.year,
    type: MediaTypeEnum.ANIME,
    description: a.description || "",
    provider: "anilist",
    raw: a,
  }));
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export type AniListMedia = {
  id: number;
  idMal?: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  coverImage: {
    large: string;
    medium: string;
    extraLarge?: string;
  };
  bannerImage?: string;
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  description?: string;
  season?: string;
  seasonYear?: number;
  type: "ANIME" | "MANGA";
  format?: string;
  status?: string;
  episodes?: number;
  chapters?: number;
  volumes?: number;
  duration?: number;
  genres?: string[];
  averageScore?: number;
  popularity?: number;
  isAdult?: boolean;
  countryOfOrigin?: string;
  studios?: {
    nodes: Array<{
      id: number;
      name: string;
    }>;
  };
  staff?: {
    edges: Array<{
      role: string;
      node: {
        id: number;
        name: {
          full: string;
          native?: string;
        };
        image?: {
          large: string;
          medium: string;
        };
        description?: string;
        languageV2?: string;
      };
    }>;
  };
};

const BASE = "https://graphql.anilist.co";

// Controller para cancelar requisições antigas
let searchController: AbortController | null = null;

export async function searchAniList(
  title: string,
  type: "ANIME" | "MANGA" = "MANGA"
): Promise<AniListMedia[]> {
  if (!title || title.trim().length === 0) return [];

  const cacheKey = `${type}-${title.toLowerCase().trim()}`;

  // Verificar cache
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("📦 Retornando do cache AniList:", cacheKey);
    return cached.data;
  }

  // Cancelar requisição anterior se existir
  if (searchController) {
    searchController.abort();
  }
  searchController = new AbortController();

  const query = `
    query ($search: String, $type: MediaType) {
      Page(page: 1, perPage: 20) {
        media(search: $search, type: $type, sort: POPULARITY_DESC) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
            large
            medium
          }
          bannerImage
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          description
          season
          seasonYear
          type
          format
          status
          episodes
          chapters
          volumes
          duration
          genres
          averageScore
          popularity
          isAdult
          countryOfOrigin
          studios {
            nodes {
              id
              name
            }
          }
        }
      }
    }
  `;

  const variables = {
    search: title,
    type: type,
  };

  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      signal: searchController.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AniList API error: ${res.status} ${text}`);
    }

    const data = await res.json();

    if (data.errors) {
      throw new Error(`AniList GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    const items: AniListMedia[] = data.data?.Page?.media || [];

    // Salvar no cache
    searchCache.set(cacheKey, { data: items, timestamp: Date.now() });

    // Limpar cache antigo (manter apenas últimas 100 buscas)
    if (searchCache.size > 100) {
      const oldestKey = searchCache.keys().next().value;
      searchCache.delete(oldestKey);
    }

    return items;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("🚫 Requisição AniList cancelada");
      return [];
    }
    throw error;
  }
}

export async function getAniListDetails(id: number, MediaType: MediaTypeEnum) {
  const type = MediaType === MediaTypeEnum.ANIME ? "ANIME" : "MANGA";

  const query = `
    query ($id: Int, $type: MediaType) {
      Media(id: $id, type: $type) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
        }
        bannerImage
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        description
        season
        seasonYear
        type
        format
        status
        episodes
        chapters
        volumes
        duration
        genres
        synonyms
        averageScore
        meanScore
        popularity
        favourites
        hashtag
        isAdult
        countryOfOrigin
        source
        trailer {
          id
          site
          thumbnail
        }
        tags {
          id
          name
          rank
        }
        relations {
          edges {
            relationType
            node {
              id
              title {
                romaji
                english
              }
              type
              format
            }
          }
        }
        characters(page: 1, perPage: 10, sort: ROLE) {
          nodes {
            id
            name {
              full
            }
            image {
              large
            }
          }
        }
        staff(page: 1, perPage: 20, sort: RELEVANCE) {
          edges {
            role
            node {
              id
              name {
                full
                native
              }
              image {
                large
                medium
              }
              description
              languageV2
            }
          }
        }
        studios {
          nodes {
            id
            name
          }
        }
        recommendations(page: 1, perPage: 5, sort: RATING_DESC) {
          nodes {
            mediaRecommendation {
              id
              title {
                romaji
                english
              }
              coverImage {
                large
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    id: id,
    type: type,
  };

  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AniList API error: ${res.status} ${text}`);
  }

  const data = await res.json();

  if (data.errors) {
    throw new Error(`AniList GraphQL error: ${JSON.stringify(data.errors)}`);
  }

  return data.data?.Media;
}

// Buscar trending anime/manga
export async function getTrendingAniList(type: "ANIME" | "MANGA" = "ANIME") {
  const query = `
    query ($type: MediaType) {
      Page(page: 1, perPage: 10) {
        media(type: $type, sort: TRENDING_DESC) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            medium
          }
          averageScore
          popularity
          type
          format
          status
        }
      }
    }
  `;

  const variables = { type };

  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!res.ok) throw new Error("AniList trending error");

  const data = await res.json();
  return data.data?.Page?.media || [];
}

// Buscar por temporada (apenas para anime)
export async function getSeasonalAnime(
  season: "WINTER" | "SPRING" | "SUMMER" | "FALL",
  year: number
) {
  const query = `
    query ($season: MediaSeason, $year: Int) {
      Page(page: 1, perPage: 20) {
        media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            medium
          }
          averageScore
          popularity
          episodes
          format
          status
        }
      }
    }
  `;

  const variables = { season, year };

  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!res.ok) throw new Error("AniList seasonal error");

  const data = await res.json();
  return data.data?.Page?.media || [];
}

// Função utilitária para limpar cache manualmente
export function clearAniListCache() {
  searchCache.clear();
  console.log("🧹 Cache AniList limpo");
}

// Helper functions para extrair staff específicos
export function getAuthor(media: AniListMedia): string | undefined {
  const authorEdge = media.staff?.edges.find(
    (edge) => edge.role?.toLowerCase().includes("story") ||
      edge.role?.toLowerCase().includes("original creator")
  );
  return authorEdge?.node.name.full;
}

export function getArtist(media: AniListMedia): string | undefined {
  const artistEdge = media.staff?.edges.find(
    (edge) => edge.role?.toLowerCase().includes("art")
  );
  return artistEdge?.node.name.full;
}

export function getStaffByRole(media: AniListMedia, roleKeyword: string): Array<{
  name: string;
  role: string;
  id: number;
}> {
  if (!media.staff?.edges) return [];

  return media.staff.edges
    .filter((edge) => edge.role?.toLowerCase().includes(roleKeyword.toLowerCase()))
    .map((edge) => ({
      name: edge.node.name.full,
      role: edge.role,
      id: edge.node.id,
    }));
}

// Helper para remover HTML tags da descrição
export function cleanDescription(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .trim();
}