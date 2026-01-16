import { MediaItem } from "@/types/mediaItem";
import { MediaTypeEnum } from "@/utils/mediaText";

// Normalized search returning MediaItem[]
export async function searchMangaNormalized(title: string): Promise<MediaItem[]> {
  const mangas = await searchManga(title);

  return mangas.map((m) => ({
    id: m.id,
    title: m.attributes.title?.en || Object.values(m.attributes.title)[0] || "",
    coverUrl: m.coverUrl,
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

  // attach coverUrl if cover_art relationship is present (prefer included data)
  const items: MangaDexManga[] = raw.map((item) => {
    const it = item as any;
    // relationships may point to the cover id; find it
    const rels: unknown[] = it.relationships || [];
    const coverRel = rels.find((r) => typeof r === "object" && r !== null && (r as any).type === "cover_art");
    const coverId = coverRel && typeof coverRel === "object" ? (coverRel as any).id : undefined;
    const fileName = coverId ? coverMap[coverId] : undefined;
    const coverUrl = fileName ? `https://uploads.mangadex.org/covers/${it.id}/${fileName}` : undefined;
    return { ...(it as MangaDexManga), coverUrl } as MangaDexManga;
  });

  return items;
}

export async function getMangaDetails(id: string) {
  const res = await fetch(`https://api.mangadex.org/manga/${id}`);
  if (!res.ok) throw new Error("MangaDex details error");
  return res.json();
}
