import { parseApiError } from "@/lib/apiError";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { API_BASE_URL } from "@/querries/apiBase";
import type {
  SuwayomiCategoriesResponse,
  SuwayomiCategoryPayload,
  SuwayomiConfig,
  SuwayomiConfigPayload,
  SuwayomiLink,
  SuwayomiLinkStatus,
  SuwayomiLinkUpdate,
  SuwayomiSyncResponse,
  SuwayomiTestResponse,
} from "@/types/suwayomi";

async function apiFetch<T>(
  path: string,
  options?: globalThis.RequestInit,
  timeoutMs?: number
): Promise<T> {
  const { headers, ...rest } = options ?? {};
  const res = await fetchWithTimeout(
    `${API_BASE_URL}${path}`,
    {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    },
    timeoutMs
  );

  if (!res.ok) throw await parseApiError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const suwayomiApi = {
  getConfig(userId: number): Promise<SuwayomiConfig> {
    return apiFetch<SuwayomiConfig>(`/api/suwayomi/config?user_id=${userId}`);
  },

  saveConfig(data: SuwayomiConfigPayload): Promise<SuwayomiConfig> {
    return apiFetch<SuwayomiConfig>("/api/suwayomi/config", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async testConnection(data: {
    userId?: number;
    baseUrl?: string;
    username?: string;
    password?: string;
  }): Promise<SuwayomiTestResponse> {
    return apiFetch<SuwayomiTestResponse>("/api/suwayomi/test", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getCategories(userId: number): Promise<SuwayomiCategoriesResponse> {
    return apiFetch<SuwayomiCategoriesResponse>(
      `/api/suwayomi/categories?user_id=${userId}`,
      undefined,
      120_000
    );
  },

  saveCategories(
    userId: number,
    categories: SuwayomiCategoryPayload[]
  ): Promise<SuwayomiCategoriesResponse> {
    return apiFetch<SuwayomiCategoriesResponse>("/api/suwayomi/categories", {
      method: "PUT",
      body: JSON.stringify({ userId, categories }),
    });
  },

  syncNow(userId: number): Promise<SuwayomiSyncResponse> {
    return apiFetch<SuwayomiSyncResponse>(
      `/api/suwayomi/sync?user_id=${userId}`,
      { method: "POST" },
      300_000
    );
  },

  getLinks(userId: number, status: SuwayomiLinkStatus = "pending"): Promise<SuwayomiLink[]> {
    return apiFetch<SuwayomiLink[]>(
      `/api/suwayomi/links?user_id=${userId}&status=${status}`
    );
  },

  updateLink(
    userId: number,
    linkId: number,
    data: SuwayomiLinkUpdate
  ): Promise<SuwayomiLink> {
    return apiFetch<SuwayomiLink>(`/api/suwayomi/links/${linkId}?user_id=${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
