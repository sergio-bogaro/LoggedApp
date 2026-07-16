import { MediaItem } from "@/types/media";
import { MediaTypeEnum } from "@/types/media";

// Normalized search returning MediaItem[]
export async function searchMangaNormalized(title: string): Promise<MediaItem[]> {
  const mangas = await searchManga(title);

  return mangas.map((m) => ({
    id: m.id,
    title: m.attributes.title?.en || Object.values(m.attributes.title)[0] || "",
    coverUrl: m.coverUrl ?? "",
    year: m.attributes.year,
    type: MediaTypeEnum.MANGA,
    description: m.attributes.description?.en || "",
    provider: "mangadex",
    raw: m,
  }));
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export type MangaDexManga = {
  id: string;
  type: string;
  attributes: {
    title: Record<string, string>;
    altTitles?: Array<Record<string, string>>;
    description?: Record<string, string>;
    year?: number;
    status?: string;
    tags?: Array<{ id: string; attributes: { name: Record<string, string> } }>;
  };
  relationships?: Array<{
    id: string;
    type: string;
    attributes?: {
      fileName?: string;
    };
  }>;
  // computed property for convenience
  coverUrl?: string;
};

const BASE = "https://api.mangadex.org";

export async function searchManga(title: string): Promise<MangaDexManga[]> {
  if (!title || title.trim().length === 0) return [];
  const url = `${BASE}/manga`;
  const params = new URLSearchParams();
  params.set("title", title);
  // request cover relationships explicitly
  params.set("includes[]", "cover_art");

  const res = await fetch(`${url}?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MangaDex API error: ${res.status} ${text}`);
  }

  const data = await res.json();

  const raw: unknown[] = data.data || [];
  const included: unknown[] = data.included || [];

  // build a map of cover id -> fileName from included array
  const coverMap: Record<string, string> = {};
  for (const inc of included) {
    if (inc && typeof inc === "object") {
      const o = inc as any;
      if (o.type === "cover_art" && o.attributes && o.attributes.fileName) {
        coverMap[o.id] = o.attributes.fileName;
      }
    }
  }

  // attach coverUrl if cover_art relationship is present
  const items: MangaDexManga[] = raw.map((item) => {
    const it = item as any;
    const rels: unknown[] = it.relationships || [];

    // First try to find cover in relationships with attributes (inline data)
    let coverRel = rels.find((r) => {
      if (typeof r === "object" && r !== null) {
        const rel = r as any;
        return rel.type === "cover_art" && rel.attributes?.fileName;
      }
      return false;
    });

    let fileName: string | undefined;

    if (coverRel && typeof coverRel === "object") {
      // If cover has inline attributes, use it directly
      const rel = coverRel as any;
      fileName = rel.attributes?.fileName;
    } else {
      // Otherwise, look up the cover id in the included map
      coverRel = rels.find((r) => typeof r === "object" && r !== null && (r as any).type === "cover_art");
      const coverId = coverRel && typeof coverRel === "object" ? (coverRel as any).id : undefined;
      fileName = coverId ? coverMap[coverId] : undefined;
    }

    // Opções de qualidade:
    // Original (máxima): fileName
    // Thumbnail 512px: fileName + '.512.jpg'
    // Thumbnail 256px: fileName + '.256.jpg'
    const coverUrl = fileName ? `https://uploads.mangadex.org/covers/${it.id}/${fileName}.256.jpg` : undefined;

    return {
      id: it.id,
      type: it.type,
      attributes: it.attributes,
      relationships: it.relationships,
      coverUrl
    } as MangaDexManga;
  });

  return items;
}

// ============================================
// Cover Art — Browse alternative covers
// ============================================

export type MangaCoverArt = {
  id: string;
  volume: string | null;
  fileName: string;
  description: string | null;
  locale: string;
};

/**
 * Fetch all cover art for a manga by its MangaDex ID.
 * Returns cover URLs ready for display.
 */
export async function getMangaCovers(mangaId: string): Promise<MangaCoverArt[]> {
  const params = new URLSearchParams();
  params.set("manga[]", mangaId);
  params.set("limit", "20");
  params.set("order[volume]", "asc");

  const res = await fetch(`${BASE}/cover?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MangaDex cover API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const covers: MangaCoverArt[] = (data.data || []).map((c: any) => ({
    id: c.id,
    volume: c.attributes?.volume || null,
    fileName: c.attributes?.fileName || "",
    description: c.attributes?.description || null,
    locale: c.attributes?.locale || "",
  }));

  return covers;
}

/**
 * Build a MangaDex cover URL at the given size.
 */
export function mangaCoverUrl(mangaId: string, fileName: string, size: 256 | 512 = 512): string {
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.${size}.jpg`;
}

/**
 * Search MangaDex by title and return covers from the first result.
 * Used when we have a title but not the MangaDex ID.
 */
export async function searchMangaCovers(title: string): Promise<Array<{ url: string; volume: string | null; label: string }>> {
  if (!title || title.trim().length === 0) return [];

  // Step 1: search for the manga
  const searchParams = new URLSearchParams();
  searchParams.set("title", title);
  searchParams.set("limit", "1");
  searchParams.set("includes[]", "cover_art");

  const searchRes = await fetch(`${BASE}/manga?${searchParams.toString()}`);
  if (!searchRes.ok) return [];

  const searchData = await searchRes.json();
  const manga = searchData.data?.[0];
  if (!manga) return [];

  const mangaId = manga.id as string;

  // Step 2: fetch covers for that manga
  const covers = await getMangaCovers(mangaId);

  return covers
    .filter((c) => c.fileName)
    .map((c) => ({
      url: mangaCoverUrl(mangaId, c.fileName, 512),
      volume: c.volume,
      label: c.volume ? `Vol. ${c.volume}` : "Cover",
    }));
}

export async function getMangaDetails(id: string) {
  const params = new URLSearchParams();
  params.set("includes[]", "cover_art");

  const res = await fetch(`${BASE}/manga/${id}?${params.toString()}`);
  if (!res.ok) throw new Error("MangaDex details error");

  const data = await res.json();

  // Process cover the same way as in searchManga
  if (data.data) {
    const relationships = data.data.relationships || [];
    const included = data.included || [];

    // Build cover map from included
    const coverMap: Record<string, string> = {};
    for (const inc of included) {
      if (inc && typeof inc === "object") {
        const o = inc as any;
        if (o.type === "cover_art" && o.attributes && o.attributes.fileName) {
          coverMap[o.id] = o.attributes.fileName;
        }
      }
    }

    // Find cover
    let coverRel = relationships.find((r: any) => {
      return r.type === "cover_art" && r.attributes?.fileName;
    });

    let fileName: string | undefined;

    if (coverRel?.attributes?.fileName) {
      fileName = coverRel.attributes.fileName;
    } else {
      coverRel = relationships.find((r: any) => r.type === "cover_art");
      fileName = coverRel?.id ? coverMap[coverRel.id] : undefined;
    }

    if (fileName) {
      // Opções de qualidade:
      // Original (máxima): fileName
      // Thumbnail 512px: fileName + '.512.jpg'
      // Thumbnail 256px: fileName + '.256.jpg'
      data.data.coverUrl = `https://uploads.mangadex.org/covers/${data.data.id}/${fileName}.256.jpg`;
    }
  }

  return data;
}