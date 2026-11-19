/* eslint-disable no-undef -- RequestInit/BodyInit são tipos do DOM */
import { parseApiError } from "@/lib/apiError";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { API_BASE_URL } from "@/querries/apiBase";

/**
 * Cliente HTTP único da API do Logged.
 *
 * - Prefixa `API_BASE_URL` e aplica timeout (`timeoutMs`).
 * - Serializa objetos como JSON; `FormData`/`Blob`/`URLSearchParams` passam
 *   direto e sem `Content-Type` (o browser define o boundary).
 * - Normaliza erros em `ApiError` e trata 204/body vazio.
 */
type JsonBody = object | string | number | boolean | null;

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | JsonBody;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 20_000;

function isBinaryBody(body: ApiFetchOptions["body"]): boolean {
  return (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    (typeof ReadableStream !== "undefined" && body instanceof ReadableStream)
  );
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const { body, headers, timeoutMs: optionTimeout, ...rest } = options;
  const binary = isBinaryBody(body);
  // String já é JSON (callers usam JSON.stringify); objetos são serializados aqui.
  const serialized: BodyInit | undefined =
    body === undefined
      ? undefined
      : typeof body === "string" || binary
        ? (body as BodyInit)
        : JSON.stringify(body);

  const response = await fetchWithTimeout(
    `${API_BASE_URL}${path}`,
    {
      ...rest,
      headers: {
        // JSON é o padrão; FormData/Blob precisam que o browser defina o header.
        ...(body !== undefined && !binary ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: serialized,
    },
    optionTimeout ?? timeoutMs
  );

  if (!response.ok) throw await parseApiError(response);
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
