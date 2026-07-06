import { MediaListItem, MediaListItemCreatePayload } from "@/types/mediaList";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, options?: globalThis.RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

// ──────────────────────────────────────────────
// Favorites
// ──────────────────────────────────────────────

export async function getFavorites(userId: number): Promise<MediaListItem[]> {
  return apiFetch<MediaListItem[]>(`/api/favorites/${userId}`);
}

export async function checkFavorite(
  userId: number,
  externalId: string,
  mediaType: string
): Promise<{ inList: boolean; itemId: number | null }> {
  const params = new URLSearchParams({
    user_id: userId.toString(),
    external_id: externalId,
    media_type: mediaType,
  });
  return apiFetch(`/api/favorites/check?${params}`);
}

export async function addToFavorites(data: MediaListItemCreatePayload): Promise<MediaListItem> {
  return apiFetch<MediaListItem>("/api/favorites/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function batchAddToFavorites(
  items: MediaListItemCreatePayload[]
): Promise<MediaListItem[]> {
  return apiFetch<MediaListItem[]>("/api/favorites/batch", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export async function removeFromFavorites(itemId: number, userId: number): Promise<void> {
  await apiFetch<void>(`/api/favorites/${itemId}?user_id=${userId}`, {
    method: "DELETE",
  });
}

// ──────────────────────────────────────────────
// Backlog
// ──────────────────────────────────────────────

export async function getBacklog(userId: number): Promise<MediaListItem[]> {
  return apiFetch<MediaListItem[]>(`/api/backlog/${userId}`);
}

export async function checkBacklog(
  userId: number,
  externalId: string,
  mediaType: string
): Promise<{ inList: boolean; itemId: number | null }> {
  const params = new URLSearchParams({
    user_id: userId.toString(),
    external_id: externalId,
    media_type: mediaType,
  });
  return apiFetch(`/api/backlog/check?${params}`);
}

export async function addToBacklog(data: MediaListItemCreatePayload): Promise<MediaListItem> {
  return apiFetch<MediaListItem>("/api/backlog/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function batchAddToBacklog(
  items: MediaListItemCreatePayload[]
): Promise<MediaListItem[]> {
  return apiFetch<MediaListItem[]>("/api/backlog/batch", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export async function removeFromBacklog(itemId: number, userId: number): Promise<void> {
  await apiFetch<void>(`/api/backlog/${itemId}?user_id=${userId}`, {
    method: "DELETE",
  });
}
