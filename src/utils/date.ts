/* eslint-disable @typescript-eslint/no-unused-vars */
export function newIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatFromIsoDate(iso: string, to: "dd/mm/yyyy" | "mm/dd/yyyy" = "dd/mm/yyyy"): string | null {
  if (!iso) return null;

  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const [_, year, mm, dd] = match;

  if (to === "dd/mm/yyyy") {
    return `${dd}/${mm}/${year}`;
  }

  if (to === "mm/dd/yyyy") {
    return `${mm}/${dd}/${year}`;
  }

  return null;
}