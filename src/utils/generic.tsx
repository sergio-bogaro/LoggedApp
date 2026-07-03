function toBcp47Locale(locale: string): string {
  const normalized = locale?.toLowerCase() ?? ""

  if (normalized.startsWith("pt")) return "pt-BR"
  if (normalized.startsWith("en")) return "en-US"

  return "en-US"
}