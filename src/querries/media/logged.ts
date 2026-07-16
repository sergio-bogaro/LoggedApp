import { MediaCreatePayload, MediaLogCreatePayload, MediaLogResponse, MediaLogUpdatePayload, MediaResponse, MediaUpdatePayload, MediaWithLogsResponse } from "@/types/logged";
import { MediaStatusEnum, MediaTypeEnum } from "@/types/media";

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

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

// ──────────────────────────────────────────────
// Media — CRUD
// ──────────────────────────────────────────────

export async function getMediaList(userId: number, params?: { type?: MediaTypeEnum; status?: MediaStatusEnum; search?: string; hasLogs?: boolean; limit?: number; offset?: number }): Promise<MediaResponse[]> {
  const url = new URLSearchParams();
  url.set("user_id", userId.toString());
  if (params?.type) url.set("type", params.type);
  if (params?.status) url.set("status", params.status);
  if (params?.search) url.set("search", params.search);
  if (params?.hasLogs !== undefined) url.set("has_logs", params.hasLogs.toString());
  if (params?.limit !== undefined) url.set("limit", params.limit.toString());
  if (params?.offset !== undefined) url.set("offset", params.offset.toString());
  
  const qs = url.toString();
  return apiFetch<MediaResponse[]>(`/api/media/${qs ? `?${qs}` : ""}`);
}

export async function getMediaById(id: number, userId: number): Promise<MediaWithLogsResponse> {
  return apiFetch<MediaWithLogsResponse>(`/api/media/${id}?user_id=${userId}`);
}

export async function getMediaByExternalId(externalId: string, type: MediaTypeEnum, userId: number): Promise<MediaResponse | null> {
  try {
    return await apiFetch<MediaResponse | null>(
      `/api/media/external/${externalId}?type=${type}&user_id=${userId}`
    );
  } catch {
    return null;
  }
}

export async function getMediaByExternalIdWithLogs(externalId: string, type: MediaTypeEnum, userId: number): Promise<MediaWithLogsResponse | null> {
  try {
    return await apiFetch<MediaWithLogsResponse | null>(
      `/api/media/external/${externalId}/with-logs?type=${type}&user_id=${userId}`
    );
  } catch {
    return null;
  }
}

export type MediaCheckItem = {
  externalId: string;
  type: MediaTypeEnum;
};

export async function batchCheckExisting(items: MediaCheckItem[], userId: number): Promise<Record<string, MediaResponse>> {
  if (items.length === 0) return {};

  return apiFetch<Record<string, MediaResponse>>(`/api/media/batch-check?user_id=${userId}`, {
    method: "POST",
    body: JSON.stringify(items),
  });
}

export async function createMedia(data: MediaCreatePayload): Promise<MediaResponse> {
  return apiFetch<MediaResponse>("/api/media/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMedia(id: number, data: MediaUpdatePayload, userId: number): Promise<MediaResponse> {
  return apiFetch<MediaResponse>(`/api/media/${id}?user_id=${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function uploadMediaImage(id: number, file: File, userId: number): Promise<MediaResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/media/${id}/image?user_id=${userId}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return (await res.json()) as MediaResponse;
}

export async function uploadMediaImageFromUrl(id: number, imageUrl: string, userId: number): Promise<MediaResponse> {
  const res = await fetch(`${API_BASE}/api/media/${id}/image-url?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return (await res.json()) as MediaResponse;
}

export async function removeMediaImage(id: number, userId: number): Promise<MediaResponse> {
  const res = await fetch(`${API_BASE}/api/media/${id}/image?user_id=${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return (await res.json()) as MediaResponse;
}

export async function deleteMedia(id: number, userId: number): Promise<void> {
  await apiFetch<void>(`/api/media/${id}?user_id=${userId}`, { method: "DELETE" });
}

// ──────────────────────────────────────────────
// Media Logs — CRUD
// ──────────────────────────────────────────────

export async function getMediaLogs(mediaId: number, userId: number): Promise<MediaLogResponse[]> {
  return apiFetch<MediaLogResponse[]>(`/api/media-logs/media/${mediaId}?user_id=${userId}`);
}

export async function getMediaLog(logId: number, userId: number): Promise<MediaLogResponse> {
  return apiFetch<MediaLogResponse>(`/api/media-logs/${logId}?user_id=${userId}`);
}

export async function createMediaLog(data: MediaLogCreatePayload): Promise<MediaLogResponse> {
  return apiFetch<MediaLogResponse>("/api/media-logs/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMediaLog(logId: number, data: MediaLogUpdatePayload, userId: number): Promise<MediaLogResponse> {
  return apiFetch<MediaLogResponse>(`/api/media-logs/${logId}?user_id=${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteMediaLog(logId: number, userId: number): Promise<void> {
  await apiFetch<void>(`/api/media-logs/${logId}?user_id=${userId}`, { method: "DELETE" });
}

// ──────────────────────────────────────────────
// Helpers — URLs de imagem
// ──────────────────────────────────────────────

export function mediaImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  return `${API_BASE}/uploads/${imagePath}`;
}
