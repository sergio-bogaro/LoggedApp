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

import { MediaItem } from "@/types/mediaItem";
import { MediaTypeEnum } from "@/utils/mediaText";

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
    coverUrl: m.attributes.posterImage?.medium || m.attributes.posterImage?.small || m.attributes.posterImage?.large,
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
    coverUrl: m.attributes.posterImage?.medium || m.attributes.posterImage?.small || m.attributes.posterImage?.large,
    year: m.attributes.startDate ? new Date(m.attributes.startDate).getFullYear() : undefined,
    type: MediaTypeEnum.MOVIES,
    description: m.attributes.synopsis || "",
    provider: "kitsu",
    raw: m,
  }));
}

export async function getKitsuDetails(id: string, type: "anime" | "manga") {
  const res = await fetch(`${KITSU_BASE}/${type}/${id}`);
  if (!res.ok) throw new Error("Kitsu details error");
  return res.json();
}
