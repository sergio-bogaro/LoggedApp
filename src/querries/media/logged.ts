import { ApiError } from "@/lib/apiError";
import { apiFetch } from "@/lib/http";
import { API_BASE_URL } from "@/querries/apiBase";
import { MediaCreatePayload, MediaLogCreatePayload, MediaLogResponse, MediaLogUpdatePayload, MediaResponse, MediaUpdatePayload, MediaWithLogsResponse } from "@/types/logged";
import { MediaStatusEnum, MediaTypeEnum } from "@/types/media";

// ──────────────────────────────────────────────
// Media — CRUD
// ──────────────────────────────────────────────

export type MediaListParams = {
  types?: MediaTypeEnum[];
  status?: MediaStatusEnum;
  search?: string;
  tags?: string[];
  hasLogs?: boolean;
  limit?: number;
  offset?: number;
};

export async function getMediaList(userId: number, params?: MediaListParams): Promise<MediaResponse[]> {
  const url = new URLSearchParams();
  url.set("user_id", userId.toString());
  if (params?.types) params.types.forEach((type) => url.append("type", type));
  if (params?.status) url.set("status", params.status);
  if (params?.search) url.set("search", params.search);
  if (params?.tags) params.tags.forEach((tag) => url.append("tags", tag));
  if (params?.hasLogs !== undefined) url.set("has_logs", params.hasLogs.toString());
  if (params?.limit !== undefined) url.set("limit", params.limit.toString());
  if (params?.offset !== undefined) url.set("offset", params.offset.toString());
  
  const qs = url.toString();
  return apiFetch<MediaResponse[]>(`/api/media/${qs ? `?${qs}` : ""}`);
}

/** Página máxima aceita pela API. Usada para buscar a biblioteca completa em blocos. */
const API_PAGE_SIZE = 500;

/**
 * Biblioteca inteira, buscada em páginas. A API limita cada resposta a 500
 * itens; o consumidor final (views, gráficos, coleções) continua recebendo tudo.
 */
export async function getAllMedia(
  userId: number,
  params: Omit<MediaListParams, "limit" | "offset"> = {}
): Promise<MediaResponse[]> {
  const all: MediaResponse[] = [];
  for (let offset = 0; ; offset += API_PAGE_SIZE) {
    const page = await getMediaList(userId, {
      ...params,
      limit: API_PAGE_SIZE,
      offset,
    });
    all.push(...page);
    if (page.length < API_PAGE_SIZE) return all;
  }
}

export async function getTags(userId: number, type?: MediaTypeEnum): Promise<string[]> {
  const url = new URLSearchParams();
  url.set("user_id", userId.toString());
  if (type) url.set("type", type);

  return apiFetch<string[]>(`/api/media/tags?${url.toString()}`);
}

export async function getMediaById(id: number, userId: number): Promise<MediaWithLogsResponse> {
  return apiFetch<MediaWithLogsResponse>(`/api/media/${id}?user_id=${userId}`);
}

export async function getMediaByExternalId(externalId: string, type: MediaTypeEnum, userId: number): Promise<MediaResponse | null> {
  try {
    return await apiFetch<MediaResponse | null>(
      `/api/media/external/${externalId}?type=${type}&user_id=${userId}`
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getMediaByExternalIdWithLogs(externalId: string, type: MediaTypeEnum, userId: number): Promise<MediaWithLogsResponse | null> {
  try {
    return await apiFetch<MediaWithLogsResponse | null>(
      `/api/media/external/${externalId}/with-logs?type=${type}&user_id=${userId}`
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
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

  return apiFetch<MediaResponse>(`/api/media/${id}/image?user_id=${userId}`, {
    method: "POST",
    body: formData,
    timeoutMs: 60_000,
  });
}

export async function uploadMediaImageFromUrl(id: number, imageUrl: string, userId: number): Promise<MediaResponse> {
  return apiFetch<MediaResponse>(`/api/media/${id}/image-url?user_id=${userId}`, {
    method: "POST",
    body: { url: imageUrl },
    timeoutMs: 60_000,
  });
}

export async function removeMediaImage(id: number, userId: number): Promise<MediaResponse> {
  return apiFetch<MediaResponse>(`/api/media/${id}/image?user_id=${userId}`, {
    method: "DELETE",
  });
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

export type MediaLogMediaSummary = {
  id: number;
  externalId: string;
  title: string;
  type: MediaTypeEnum;
  coverUrl?: string | null;
  imagePath?: string | null;
  releaseDate?: string | null;
};

/** A log together with the media it belongs to — the unit of the register. */
export type MediaLogWithMedia = MediaLogResponse & {
  media: MediaLogMediaSummary | null;
};

export type MediaLogListParams = {
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
};

export async function getUserMediaLogs(
  userId: number,
  params?: MediaLogListParams
): Promise<MediaLogWithMedia[]> {
  const url = new URLSearchParams();
  url.set("user_id", userId.toString());
  if (params?.start) url.set("start", params.start);
  if (params?.end) url.set("end", params.end);
  if (params?.limit !== undefined) url.set("limit", params.limit.toString());
  if (params?.offset !== undefined) url.set("offset", params.offset.toString());

  return apiFetch<MediaLogWithMedia[]>(`/api/media-logs/?${url.toString()}`);
}

/** Todos os logs do período, paginados em blocos de 500. */
export async function getAllMediaLogs(
  userId: number,
  params: Omit<MediaLogListParams, "limit" | "offset"> = {}
): Promise<MediaLogWithMedia[]> {
  const all: MediaLogWithMedia[] = [];
  for (let offset = 0; ; offset += API_PAGE_SIZE) {
    const page = await getUserMediaLogs(userId, {
      ...params,
      limit: API_PAGE_SIZE,
      offset,
    });
    all.push(...page);
    if (page.length < API_PAGE_SIZE) return all;
  }
}

// ──────────────────────────────────────────────
// Helpers — URLs de imagem
// ──────────────────────────────────────────────

export function mediaImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  return `${API_BASE_URL}/uploads/${imagePath}`;
}
