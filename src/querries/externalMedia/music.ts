/* eslint-disable @typescript-eslint/no-explicit-any */
// Use iTunes Search API for album search (no API key required).
// This is a simpler, more reliable API for quick album lookups.
import { MediaItem, MediaTypeEnum } from "@/types/media";

export type MusicAlbum = {
  id: string; // use iTunes collectionId as id
  title: string;
  "artist-credit"?: Array<{ name: string }>;
  date?: string;
  coverUrl?: string;
};

export type MusicTrack = {
  id: number;
  title: string;
  trackNumber?: number;
  durationMs?: number;
};

export type MusicAlbumDetails = {
  collectionId: number;
  title: string;
  artist?: string;
  genre?: string;
  releaseDate?: string;
  coverUrl?: string;
  trackCount?: number;
  tracks: MusicTrack[];
};

const ITUNES_SEARCH = "https://itunes.apple.com/search";
const ITUNES_LOOKUP = "https://itunes.apple.com/lookup";

export async function searchAlbums(title: string): Promise<MusicAlbum[]> {
  if (!title || title.trim().length === 0) return [];
  const params = new URLSearchParams();
  params.set("term", title);
  params.set("entity", "album");
  params.set("limit", "30");

  const res = await fetch(`${ITUNES_SEARCH}?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`iTunes API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const results = data.results || [];

  const rawItems: MusicAlbum[] = results.map((r: any) => {
    const id = String(r.collectionId);
    const title = r.collectionName;
    const artist = r.artistName ? [{ name: r.artistName }] : undefined;
    const date = r.releaseDate ? r.releaseDate.split("T")[0] : undefined;
    // Use artworkUrl100 and request a larger size by replacing 100 with 250
    const coverUrl = r.artworkUrl100 ? r.artworkUrl100.replace("100x100", "250x250") : undefined;
    return { id, title, "artist-credit": artist, date, coverUrl } as MusicAlbum;
  });

  // dedupe by normalized title + first artist + year
  const seen = new Set<string>();
  const items: MusicAlbum[] = [];
  for (const it of rawItems) {
    const titleNorm = (it.title || "").trim().toLowerCase();
    const artist = it["artist-credit"]?.[0]?.name?.trim().toLowerCase() ?? "";
    const year = (it.date || "").slice(0, 4);
    const key = `${titleNorm}::${artist}::${year}`;
    if (!seen.has(key)) {
      seen.add(key);
      items.push(it);
    }
  }

  return items;
}

export async function getAlbumDetails(id: string) {
  // iTunes lookup by collectionId; entity=song also returns the album tracks.
  const params = new URLSearchParams();
  params.set("id", id);
  params.set("entity", "song");

  const res = await fetch(`${ITUNES_LOOKUP}?${params.toString()}`);
  if (!res.ok) throw new Error("iTunes lookup error");
  const data = await res.json();

  const results: any[] = data.results || [];
  const album = results.find((r) => r.wrapperType === "collection") ?? results[0] ?? {};

  const tracks: MusicTrack[] = results
    .filter((r) => r.wrapperType === "track")
    .map((r) => ({
      id: r.trackId,
      title: r.trackName,
      trackNumber: r.trackNumber,
      durationMs: r.trackTimeMillis,
    }));

  const details: MusicAlbumDetails = {
    collectionId: album.collectionId,
    title: album.collectionName ?? "",
    artist: album.artistName,
    genre: album.primaryGenreName,
    releaseDate: album.releaseDate ? album.releaseDate.split("T")[0] : undefined,
    coverUrl: album.artworkUrl100 ? album.artworkUrl100.replace("100x100", "300x300") : undefined,
    trackCount: album.trackCount,
    tracks,
  };

  return details;
}

export async function searchMusicNormalized(title: string): Promise<MediaItem[]> {
  const albums = await searchAlbums(title);

  return albums.map((album) => ({
    id: album.id,
    title: album.title,
    coverUrl: album.coverUrl ?? "",
    year: album.date ? Number(album.date.slice(0, 4)) : undefined,
    releaseDate: album.date,
    type: MediaTypeEnum.MUSIC,
    description: album["artist-credit"]?.[0]?.name ?? "",
    provider: "itunes",
    raw: album,
  }));
}
