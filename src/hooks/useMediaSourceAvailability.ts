import { useQuery } from "@tanstack/react-query";

import { MediaTypeEnum } from "@/types/media";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export type MediaSourceAvailability = Record<MediaTypeEnum, boolean>;

async function getIgdbConfigured(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/igdb/config`);

  if (!response.ok) {
    return true;
  }

  const data = (await response.json()) as { configured: boolean };
  return data.configured;
}

export function useMediaSourceAvailability(): {
  availability: MediaSourceAvailability;
  isLoading: boolean;
  } {
  const { data: igdbConfigured, isLoading } = useQuery({
    queryKey: ["igdb", "config"],
    queryFn: getIgdbConfigured,
    staleTime: 1000 * 60 * 10,
  });

  return {
    availability: {
      [MediaTypeEnum.MOVIES]: Boolean(import.meta.env.VITE_TMDB_API_KEY),
      [MediaTypeEnum.ANIME]: true,
      [MediaTypeEnum.MANGA]: true,
      [MediaTypeEnum.GAME]: igdbConfigured ?? true,
      [MediaTypeEnum.BOOK]: true,
    },
    isLoading,
  };
}
