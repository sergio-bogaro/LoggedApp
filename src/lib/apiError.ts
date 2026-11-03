/**
 * Erro de API padronizado. O backend devolve `detail` como string (erros de
 * domínio) ou como lista (422 do Pydantic); ambos são formatados aqui.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function formatDetail(detail: unknown): string | null {
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const entry = item as { msg?: unknown; loc?: unknown };
        if (typeof entry.msg !== "string") return null;
        const loc = Array.isArray(entry.loc)
          ? entry.loc.filter((part) => part !== "body").join(".")
          : "";
        return loc ? `${loc}: ${entry.msg}` : entry.msg;
      })
      .filter((message): message is string => !!message);

    return messages.length > 0 ? messages.join("; ") : null;
  }

  if (detail && typeof detail === "object" && "detail" in detail) {
    return formatDetail((detail as { detail?: unknown }).detail);
  }

  return null;
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let text = "";
  try {
    text = await response.text();
  } catch {
    text = "";
  }

  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  const detail =
    body && typeof body === "object" && "detail" in body
      ? (body as { detail?: unknown }).detail
      : body;
  const message =
    formatDetail(detail) ?? `A API respondeu com erro ${response.status}.`;

  return new ApiError(response.status, message, detail);
}
