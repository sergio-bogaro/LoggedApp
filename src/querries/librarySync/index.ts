import { parseApiError } from "@/lib/apiError";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { API_BASE_URL } from "@/querries/apiBase";
import type {
  GlobalSyncConfigPayload,
  GlobalSyncResponse,
  GlobalSyncSettings,
  OAuthPollResponse,
  OAuthStartResponse,
  SyncAction,
  SyncConfigPayload,
  SyncProviderInfo,
  SyncResponse,
  SyncStatusesResponse,
  SyncSuggestion,
  SyncSuggestionCountResponse,
  SyncSuggestionsApproveResponse,
  SyncSuggestionsResponse,
  SyncSuggestionState,
} from "@/types/librarySync";

async function apiFetch<T>(
  path: string,
  options?: globalThis.RequestInit,
  timeoutMs = 20_000
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

export async function listIntegrations(userId: number): Promise<SyncProviderInfo[]> {
  return apiFetch<SyncProviderInfo[]>(`/api/integrations?user_id=${userId}`);
}

export async function getGlobalSyncSettings(
  userId: number
): Promise<GlobalSyncSettings> {
  return apiFetch<GlobalSyncSettings>(
    `/api/integrations/global?user_id=${userId}`
  );
}

export async function saveGlobalSyncSettings(
  payload: GlobalSyncConfigPayload
): Promise<GlobalSyncSettings> {
  return apiFetch<GlobalSyncSettings>("/api/integrations/global", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function syncAllIntegrations(
  userId: number
): Promise<GlobalSyncResponse> {
  return apiFetch<GlobalSyncResponse>(
    "/api/integrations/sync-all",
    {
      method: "POST",
      body: JSON.stringify({ userId }),
    },
    15 * 60_000
  );
}

export async function getIntegration(
  provider: string,
  userId: number
): Promise<SyncProviderInfo> {
  return apiFetch<SyncProviderInfo>(
    `/api/integrations/${provider}?user_id=${userId}`
  );
}

export async function saveIntegrationConfig(
  provider: string,
  payload: SyncConfigPayload
): Promise<SyncProviderInfo> {
  return apiFetch<SyncProviderInfo>(`/api/integrations/${provider}/config`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function listIntegrationStatuses(
  provider: string,
  userId: number
): Promise<SyncStatusesResponse> {
  return apiFetch<SyncStatusesResponse>(
    `/api/integrations/${provider}/statuses?user_id=${userId}`
  );
}

export async function saveIntegrationStatuses(
  provider: string,
  userId: number,
  statuses: { sourceStatus: string; action: SyncAction; sourceLabel?: string }[]
): Promise<SyncStatusesResponse> {
  return apiFetch<SyncStatusesResponse>(`/api/integrations/${provider}/statuses`, {
    method: "PUT",
    body: JSON.stringify({ userId, statuses }),
  });
}

export async function testIntegration(
  provider: string,
  userId: number
): Promise<{ ok: boolean; account?: string | null; error?: string | null }> {
  return apiFetch(`/api/integrations/${provider}/test`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  }, 60_000);
}

export async function syncIntegration(
  provider: string,
  userId: number
): Promise<SyncResponse> {
  return apiFetch<SyncResponse>(
    `/api/integrations/${provider}/sync`,
    { method: "POST", body: JSON.stringify({ userId }) },
    10 * 60_000
  );
}

export async function startIntegrationOAuth(
  provider: string,
  userId: number
): Promise<OAuthStartResponse> {
  return apiFetch<OAuthStartResponse>(
    `/api/integrations/${provider}/oauth/start`,
    { method: "POST", body: JSON.stringify({ userId }) },
    30_000
  );
}

export async function pollIntegrationOAuth(
  provider: string,
  userId: number
): Promise<OAuthPollResponse> {
  return apiFetch<OAuthPollResponse>(
    `/api/integrations/${provider}/oauth/poll`,
    { method: "POST", body: JSON.stringify({ userId }) },
    30_000
  );
}

export async function deleteIntegration(
  provider: string,
  userId: number
): Promise<void> {
  await apiFetch<void>(`/api/integrations/${provider}?user_id=${userId}`, {
    method: "DELETE",
  });
}


export async function listSyncSuggestions(
  userId: number,
  params?: { state?: SyncSuggestionState; provider?: string; limit?: number; offset?: number }
): Promise<SyncSuggestionsResponse> {
  const query = new URLSearchParams();
  query.set("user_id", String(userId));
  if (params?.state) query.set("state", params.state);
  if (params?.provider) query.set("provider", params.provider);
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.offset !== undefined) query.set("offset", String(params.offset));
  return apiFetch<SyncSuggestionsResponse>(
    `/api/integrations/suggestions?${query.toString()}`
  );
}

export async function countSyncSuggestions(
  userId: number,
  provider?: string
): Promise<SyncSuggestionCountResponse> {
  const query = new URLSearchParams({ user_id: String(userId) });
  if (provider) query.set("provider", provider);
  return apiFetch<SyncSuggestionCountResponse>(
    `/api/integrations/suggestions/count?${query.toString()}`
  );
}

export async function approveSyncSuggestions(
  userId: number,
  ids: number[]
): Promise<SyncSuggestionsApproveResponse> {
  return apiFetch<SyncSuggestionsApproveResponse>(
    "/api/integrations/suggestions/approve",
    {
      method: "POST",
      body: JSON.stringify({ userId, ids }),
    },
    120_000
  );
}

export async function updateSyncSuggestion(
  userId: number,
  suggestionId: number,
  state: "pending" | "dismissed"
): Promise<SyncSuggestion> {
  return apiFetch<SyncSuggestion>(
    `/api/integrations/suggestions/${suggestionId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ userId, state }),
    }
  );
}
