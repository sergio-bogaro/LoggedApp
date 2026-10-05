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

async function readError(res: Response): Promise<string> {
  const body = await res.text();
  try {
    const parsed = JSON.parse(body) as { detail?: unknown };
    if (typeof parsed.detail === "string") return parsed.detail;
  } catch {
    // corpo não é JSON; usa o texto cru abaixo
  }
  return `API error ${res.status}: ${body}`;
}

async function apiFetch<T>(path: string, options?: globalThis.RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) throw new Error(await readError(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export type ParseImportInput = {
  userId: number;
  file?: File;
  username?: string;
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
  if (input.file) form.append("file", input.file);

  const res = await fetch(`${API_BASE_URL}/api/import/${providerId}/parse`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error(await readError(res));
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
  });
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
  });
}
