import { parseApiError } from "@/lib/apiError";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { API_BASE_URL } from "@/querries/apiBase";
import type {
  ImportCandidate,
  ImportCommitEntry,
  ImportCommitResponse,
  ImportMatchRequestItem,
  ImportMatchResult,
  ImportPreviewResponse,
  ImportProviderInfo,
} from "@/types/import";
import type { MediaTypeEnum } from "@/types/media";

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

export type ParseImportInput = {
  userId: number;
  file?: File;
  username?: string;
  sourceUrl?: string;
  mediaType?: MediaTypeEnum;
};

/** Lista os provedores de importação disponíveis. */
export async function listImportProviders(): Promise<ImportProviderInfo[]> {
  return apiFetch<ImportProviderInfo[]>("/api/import/providers");
}

/** Lê a fonte do provedor (arquivo ou username) e devolve os itens normalizados. */
export async function parseImport(
  providerId: string,
  input: ParseImportInput
): Promise<ImportPreviewResponse> {
  const form = new FormData();
  form.append("user_id", String(input.userId));
  if (input.mediaType) form.append("media_type", input.mediaType);
  if (input.username) form.append("username", input.username);
  if (input.sourceUrl) form.append("source_url", input.sourceUrl);
  if (input.file) form.append("file", input.file);

  const res = await fetchWithTimeout(`${API_BASE_URL}/api/import/${providerId}/parse`, {
    method: "POST",
    body: form,
  }, 60_000);

  if (!res.ok) throw await parseApiError(res);
  return (await res.json()) as ImportPreviewResponse;
}

/** Casa um lote de itens com o provedor de metadata. */
export async function matchImport(
  items: ImportMatchRequestItem[],
  userId: number
): Promise<ImportMatchResult[]> {
  const data = await apiFetch<{ results: ImportMatchResult[] }>("/api/import/match", {
    method: "POST",
    body: JSON.stringify({ userId, items }),
  }, 120_000);
  return data.results;
}

/** Busca manual de candidatos para corrigir um match. */
export async function searchImportCandidates(
  query: string,
  mediaType: MediaTypeEnum,
  userId: number
): Promise<ImportCandidate[]> {
  return apiFetch<ImportCandidate[]>("/api/import/search", {
    method: "POST",
    body: JSON.stringify({ query, mediaType, userId }),
  });
}

/** Grava as mídias, logs e itens de backlog confirmados. */
export async function commitImport(
  entries: ImportCommitEntry[],
  userId: number
): Promise<ImportCommitResponse> {
  return apiFetch<ImportCommitResponse>("/api/import/commit", {
    method: "POST",
    body: JSON.stringify({ userId, entries }),
  }, 120_000);
}
