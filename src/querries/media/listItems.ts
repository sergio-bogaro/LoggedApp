import { apiFetch } from "@/lib/http";
import { MediaListItem, MediaListItemCreatePayload } from "@/types/mediaList";

// ──────────────────────────────────────────────
// Favorites
// ──────────────────────────────────────────────

export async function getFavorites(userId: number): Promise<MediaListItem[]> {
  return apiFetch<MediaListItem[]>(`/api/favorites/${userId}`);
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
