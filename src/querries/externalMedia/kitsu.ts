export type KitsuManga = {
  id: string;
  type: string;
  attributes: {
    canonicalTitle?: string;
    synopsis?: string;
    startDate?: string;
    posterImage?: { small?: string; medium?: string; large?: string } | null;
  };
};

import { MediaItem } from "@/types/media";
import { MediaTypeEnum } from "@/types/media";

const KITSU_BASE = "https://kitsu.io/api/edge";

export async function searchKitsuManga(title: string): Promise<KitsuManga[]> {
  if (!title || title.trim().length === 0) return [];
  const params = new URLSearchParams();
  params.set("filter[text]", title);
  params.set("page[limit]", "20");

  const res = await fetch(`${KITSU_BASE}/manga?${params.toString()}`, {
    method: "GET",
    headers: {
      "Accept": "application/vnd.api+json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kitsu API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return (data.data || []) as KitsuManga[];
}

export type KitsuAnime = KitsuManga;

export async function searchKitsuAnime(title: string): Promise<KitsuAnime[]> {
  if (!title || title.trim().length === 0) return [];
  const params = new URLSearchParams();
  params.set("filter[text]", title);
  params.set("page[limit]", "20");

  const res = await fetch(`${KITSU_BASE}/anime?${params.toString()}`, {
    method: "GET",
    headers: {
      "Accept": "application/vnd.api+json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kitsu API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return (data.data || []) as KitsuAnime[];
}

// Normalized search returning MediaItem[]
export async function searchKitsuMangaNormalized(title: string): Promise<MediaItem[]> {
  const mangas = await searchKitsuManga(title);

  return mangas.map((m) => ({
    id: m.id,
    title: m.attributes.canonicalTitle || Object.values(m.attributes.canonicalTitle || {})[0] || "",
    coverUrl: m.attributes.posterImage?.medium ?? "",
    year: m.attributes.startDate ? new Date(m.attributes.startDate).getFullYear() : undefined,
    type: MediaTypeEnum.MANGA,
    description: m.attributes.synopsis || "",
    provider: "kitsu",
    raw: m,
  }));
}

export async function searchKitsuAnimeNormalized(title: string): Promise<MediaItem[]> {
  const animes = await searchKitsuAnime(title);

  return animes.map((m) => ({
    id: m.id,
    title: m.attributes.canonicalTitle || Object.values(m.attributes.canonicalTitle || {})[0] || "",
    coverUrl: m.attributes.posterImage?.medium ?? "",
    year: m.attributes.startDate ? new Date(m.attributes.startDate).getFullYear() : undefined,
    type: MediaTypeEnum.MOVIES,
    description: m.attributes.synopsis || "",
    provider: "kitsu",
    raw: m,
  }));
}

export async function getKitsuDetails(id: string, type: "anime" | "manga") {
  if (!id || id.trim().length === 0) throw new Error("ID is required");

  const res = await fetch(`${KITSU_BASE}/${type}/${id}`, {
    method: "GET",
    headers: {
      "Accept": "application/vnd.api+json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kitsu API error: ${res.status} ${text}`);
  }

  return await res.json();
}

// ============================================
// Browse Alternative Posters
// ============================================

/**
 * Search Kitsu for anime/manga posters by title.
 * Returns poster URLs from multiple results as alternative images.
 */
export async function searchKitsuPosters(title: string, type: "anime" | "manga"): Promise<Array<{ url: string; label: string }>> {
  if (!title || title.trim().length === 0) return [];

  const params = new URLSearchParams();
  params.set("filter[text]", title);
  params.set("page[limit]", "10");
  params.set("fields[type]", "canonicalTitle,posterImage");

  const res = await fetch(`${KITSU_BASE}/${type}?${params.toString()}`, {
    headers: { "Accept": "application/vnd.api+json" },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const items = data.data || [];

  return items
    .map((item: any) => {
      const posterUrl = item.attributes?.posterImage?.large
        || item.attributes?.posterImage?.medium
        || item.attributes?.posterImage?.small;
      const label = item.attributes?.canonicalTitle || "";
      return posterUrl ? { url: posterUrl, label } : null;
    })
    .filter((p): p is { url: string; label: string } => p !== null);
}

export async function getKitsuDetailsNormalized(
  id: string,
  type: "anime" | "manga"
): Promise<MediaItem> {
  const data = await getKitsuDetails(id, type);
  const m = data.data;

  return {
    id: m.id,
    title: m.attributes.canonicalTitle || "",
    coverUrl:
      m.attributes.posterImage?.medium ||
      m.attributes.posterImage?.small ||
      m.attributes.posterImage?.large,
    year: m.attributes.startDate
      ? new Date(m.attributes.startDate).getFullYear()
      : undefined,
    type: type === "anime" ? MediaTypeEnum.MOVIES : MediaTypeEnum.MANGA,
    description: m.attributes.synopsis || "",
    provider: "kitsu",
    raw: m,
  };
}
