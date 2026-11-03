const DEFAULT_TIMEOUT_MS = 20_000;

/**
 * `fetch` com timeout. Sem isso, uma API local travada deixa queries e
 * mutações penduradas indefinidamente.
 */
export async function fetchWithTimeout(
  input: Parameters<typeof fetch>[0],
  init: Parameters<typeof fetch>[1] = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: init.signal ?? controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}
