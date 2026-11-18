import { parseApiError } from "@/lib/apiError";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { API_BASE_URL } from "@/querries/apiBase";
import type { ImportCandidate } from "@/types/import";
import type {
  ReviewCommitResponse,
  ReviewCounts,
  ReviewItemsParams,
  ReviewItemsResponse,
} from "@/types/review";

async function apiFetch<T>(
  path: string,
  options?: globalThis.RequestInit,
  timeoutMs = 30_000
): Promise<T> {
  const { headers, ...rest } = options ?? {};
  const response = await fetchWithTimeout(
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
  if (!response.ok) throw await parseApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function listReviewItems(
  userId: number,
  params: ReviewItemsParams = {}
): Promise<ReviewItemsResponse> {
  const search = new URLSearchParams({ user_id: String(userId) });
  if (params.state) search.set("state", params.state);
  if (params.match) search.set("match", params.match);
  if (params.source) search.set("source", params.source);
  if (params.provider) search.set("provider", params.provider);
  if (params.mediaType) search.set("media_type", params.mediaType);
  if (params.search) search.set("search", params.search);
  if (params.offset != null) search.set("offset", String(params.offset));
  if (params.limit != null) search.set("limit", String(params.limit));
  return apiFetch<ReviewItemsResponse>(`/api/review/items?${search}`);
}

export async function getReviewCounts(
  userId: number,
  provider?: string
): Promise<ReviewCounts> {
  const search = new URLSearchParams({ user_id: String(userId) });
  if (provider) search.set("provider", provider);
  return apiFetch<ReviewCounts>(`/api/review/counts?${search}`);
}

export async function patchReviewItem(
  key: string,
  userId: number,
  patch: { selected?: ImportCandidate | null; ignored?: boolean | null }
) {
  return apiFetch(`/api/review/items/${encodeURIComponent(key)}`, {
    method: "PATCH",
    body: JSON.stringify({ userId, ...patch }),
  });
}

export async function setReviewState(
  userId: number,
  keys: string[],
  state: "pending" | "dismissed"
) {
  return apiFetch<void>("/api/review/state", {
    method: "POST",
    body: JSON.stringify({ userId, keys, state }),
  });
}

export async function commitReviewItems(
  userId: number,
  keys: string[],
  addToBacklog = true
): Promise<ReviewCommitResponse> {
  return apiFetch<ReviewCommitResponse>("/api/review/commit", {
    method: "POST",
    body: JSON.stringify({ userId, keys, addToBacklog }),
  });
}
