/* eslint-disable @typescript-eslint/no-explicit-any */
export type GameItem = {
  id: number;
  name: string;
  released?: string;
  background_image?: string | null;
};

const RAWG_BASE = 'https://api.rawg.io/api';
// Temporary hardcoded API key for RAWG (move to env or localStorage for production)
const RAWG_API_KEY = 'fd05b98309a6413488473dbc76d07023';

export async function searchGames(title: string): Promise<GameItem[]> {
  if (!title || title.trim().length === 0) return [];
  const params = new URLSearchParams();
  params.set('search', title);
  params.set('page_size', '20');

  // attach API key
  params.set('key', RAWG_API_KEY);
  const res = await fetch(`${RAWG_BASE}/games?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RAWG API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const results = data.results || [];
  return results.map((r: any) => ({ id: r.id, name: r.name, released: r.released, background_image: r.background_image } as GameItem));
}

export async function getGameDetails(id: number) {
  const params = new URLSearchParams();
  params.set('key', RAWG_API_KEY);
  const res = await fetch(`${RAWG_BASE}/games/${id}?${params.toString()}`);
  if (!res.ok) throw new Error('RAWG details error');
  return res.json();
}
