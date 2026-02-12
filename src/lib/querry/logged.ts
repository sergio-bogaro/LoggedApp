import { MediaTypeEnum } from "@/utils/mediaText";

// ──────────────────────────────────────────────
// Types — espelham os schemas do backend Python
// ──────────────────────────────────────────────

export type MediaStatusEnum =
  | "backlog"
  | "in_progress"
  | "completed"
  | "dropped"
  | "on_hold";

export type MediaResponse = {
  id: number;
  externalId: string;
  title: string;
  type: MediaTypeEnum;
  status: MediaStatusEnum;
  description?: string | null;
  coverUrl?: string | null;
  imagePath?: string | null;
  releaseDate?: string | null;
  rating?: number | null;
  review?: string | null;
  createdAt: string;
  updatedAt: string;
  logCount: number;
};

export type MediaLogResponse = {
  id: number;
  mediaId: number;
  date: string;
  status?: MediaStatusEnum | null;
  rating?: number | null;
  review?: string | null;
  createdAt: string;
};

export type MediaWithLogsResponse = MediaResponse & {
  logs: MediaLogResponse[];
};

export type MediaCreatePayload = {
  title: string;
  type: MediaTypeEnum;
  externalId: string;
  status?: MediaStatusEnum;
  description?: string | null;
  coverUrl?: string | null;
  releaseDate?: string | null;
  rating?: number | null;
  review?: string | null;
};

export type MediaUpdatePayload = {
  title?: string;
  status?: MediaStatusEnum;
  description?: string | null;
  coverUrl?: string | null;
  imagePath?: string | null;
  releaseDate?: string | null;
  rating?: number | null;
  review?: string | null;
};

export type MediaLogCreatePayload = {
  mediaId: number;
  date: string;
  status?: MediaStatusEnum | null;
  rating?: number | null;
  review?: string | null;
};

export type MediaLogUpdatePayload = {
  date?: string;
  status?: MediaStatusEnum | null;
  rating?: number | null;
  review?: string | null;
};

// ──────────────────────────────────────────────
// Base URL
// ──────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ──────────────────────────────────────────────
// Helper
// ──────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: globalThis.RequestInit
): Promise<T> {
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

export async function getMediaList(params?: {
  type?: MediaTypeEnum;
  status?: MediaStatusEnum;
  search?: string;
}): Promise<MediaResponse[]> {
  const url = new URLSearchParams();
  if (params?.type) url.set("type", params.type);
  if (params?.status) url.set("status", params.status);
  if (params?.search) url.set("search", params.search);

  const qs = url.toString();
  return apiFetch<MediaResponse[]>(`/api/media/${qs ? `?${qs}` : ""}`);
}

export async function getMediaById(id: number): Promise<MediaWithLogsResponse> {
  return apiFetch<MediaWithLogsResponse>(`/api/media/${id}`);
}

export async function getMediaByExternalId(
  externalId: string,
  type: MediaTypeEnum
): Promise<MediaResponse | null> {
  try {
    return await apiFetch<MediaResponse | null>(
      `/api/media/external/${externalId}?type=${type}`
    );
  } catch {
    return null;
  }
}

export type MediaCheckItem = {
  externalId: string;
  type: MediaTypeEnum;
};

export async function batchCheckExisting(
  items: MediaCheckItem[]
): Promise<Record<string, MediaResponse>> {
  if (items.length === 0) return {};

  return apiFetch<Record<string, MediaResponse>>("/api/media/batch-check", {
    method: "POST",
    body: JSON.stringify(items),
  });
}

export async function createMedia(
  data: MediaCreatePayload
): Promise<MediaResponse> {
  return apiFetch<MediaResponse>("/api/media/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMedia(
  id: number,
  data: MediaUpdatePayload
): Promise<MediaResponse> {
  return apiFetch<MediaResponse>(`/api/media/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function uploadMediaImage(
  id: number,
  file: File
): Promise<MediaResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/media/${id}/image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return (await res.json()) as MediaResponse;
}

export async function deleteMedia(id: number): Promise<void> {
  await apiFetch<void>(`/api/media/${id}`, { method: "DELETE" });
}

// ──────────────────────────────────────────────
// Media Logs — CRUD
// ──────────────────────────────────────────────

export async function getMediaLogs(
  mediaId: number
): Promise<MediaLogResponse[]> {
  return apiFetch<MediaLogResponse[]>(`/api/media-logs/media/${mediaId}`);
}

export async function getMediaLog(logId: number): Promise<MediaLogResponse> {
  return apiFetch<MediaLogResponse>(`/api/media-logs/${logId}`);
}

export async function createMediaLog(
  data: MediaLogCreatePayload
): Promise<MediaLogResponse> {
  return apiFetch<MediaLogResponse>("/api/media-logs/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMediaLog(
  logId: number,
  data: MediaLogUpdatePayload
): Promise<MediaLogResponse> {
  return apiFetch<MediaLogResponse>(`/api/media-logs/${logId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteMediaLog(logId: number): Promise<void> {
  await apiFetch<void>(`/api/media-logs/${logId}`, { method: "DELETE" });
}

// ──────────────────────────────────────────────
// Helpers — URLs de imagem
// ──────────────────────────────────────────────

export function mediaImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  return `${API_BASE}/uploads/${imagePath}`;
}
