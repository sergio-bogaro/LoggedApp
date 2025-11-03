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

const KITSU_BASE = 'https://kitsu.io/api/edge';

export async function searchKitsuManga(title: string): Promise<KitsuManga[]> {
  if (!title || title.trim().length === 0) return [];
  const params = new URLSearchParams();
  params.set('filter[text]', title);
  params.set('page[limit]', '20');

  const res = await fetch(`${KITSU_BASE}/manga?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.api+json',
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
  params.set('filter[text]', title);
  params.set('page[limit]', '20');

  const res = await fetch(`${KITSU_BASE}/anime?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.api+json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kitsu API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return (data.data || []) as KitsuAnime[];
}

export async function getKitsuDetails(id: string, type: 'anime' | 'manga') {
  const res = await fetch(`${KITSU_BASE}/${type}/${id}`);
  if (!res.ok) throw new Error('Kitsu details error');
  return res.json();
}
