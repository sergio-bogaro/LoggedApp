import { CustomViewDisplaySettings, CustomViewFilters } from "@/types/customView";
import { MediaResponse } from "@/types/logged";

/**
 * Aplica, no cliente, os filtros e a ordenação de uma custom view sobre a
 * biblioteca. O backend armazena `filters`/`display_settings` mas não os aplica;
 * para uma biblioteca pessoal filtrar no cliente é suficiente.
 */
export function applyCustomViewFilters(
  media: MediaResponse[],
  filters?: CustomViewFilters,
  display?: CustomViewDisplaySettings
): MediaResponse[] {
  let result = [...media];

  if (filters) {
    if (filters.media_types?.length) {
      result = result.filter((item) => filters.media_types!.includes(item.type));
    }
    if (filters.status?.length) {
      result = result.filter((item) => !!item.status && filters.status!.includes(item.status));
    }
    if (filters.min_rating != null) {
      result = result.filter((item) => (item.rating ?? 0) >= filters.min_rating!);
    }
    if (filters.max_rating != null) {
      result = result.filter((item) => (item.rating ?? 0) <= filters.max_rating!);
    }
    if (filters.tags?.length) {
      result = result.filter((item) =>
        filters.tags!.every((tag) => (item.tags ?? []).includes(tag))
      );
    }
    if (filters.year_from != null) {
      result = result.filter(
        (item) => Number(item.releaseDate?.slice(0, 4) ?? 0) >= filters.year_from!
      );
    }
    if (filters.year_to != null) {
      result = result.filter(
        (item) => Number(item.releaseDate?.slice(0, 4) ?? 0) <= filters.year_to!
      );
    }
  }

  const sortBy = display?.sort_by ?? "updated_at";
  const direction = display?.sort_order === "asc" ? 1 : -1;

  result.sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title) * direction;
      case "rating":
        return ((a.rating ?? 0) - (b.rating ?? 0)) * direction;
      case "release_date":
        return (a.releaseDate ?? "").localeCompare(b.releaseDate ?? "") * direction;
      case "created_at":
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
      default:
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * direction;
    }
  });

  return result;
}
