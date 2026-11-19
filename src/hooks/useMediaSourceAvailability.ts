import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";
import { useAppSelector } from "@/store/auth/hooks";
import { MediaTypeEnum } from "@/types/media";

export type MediaSourceAvailability = Record<MediaTypeEnum, boolean>;

async function fetchConfigured(path: string, userId?: number): Promise<boolean> {
  const params = userId !== undefined ? `?user_id=${userId}` : "";
  try {
    const data = await apiFetch<{ configured: boolean }>(`${path}${params}`);
    return data.configured;
  } catch {
    // Sem credencial/fora do ar: a fonte aparece indisponível, sem quebrar a tela.
    return false;
  }
}

export function useMediaSourceAvailability(): {
  availability: MediaSourceAvailability;
  isLoading: boolean;
  } {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id;

  const { data: tmdbConfigured, isLoading: isLoadingTmdb } = useQuery({
    queryKey: ["tmdb", "config", userId],
    queryFn: () => fetchConfigured("/api/tmdb/config", userId),
    staleTime: 1000 * 60 * 10,
  });

  const { data: igdbConfigured, isLoading: isLoadingIgdb } = useQuery({
    queryKey: ["igdb", "config", userId],
    queryFn: () => fetchConfigured("/api/igdb/config", userId),
    staleTime: 1000 * 60 * 10,
  });

  return {
    availability: {
      [MediaTypeEnum.MOVIES]: tmdbConfigured ?? false,
      [MediaTypeEnum.ANIME]: true,
      [MediaTypeEnum.SERIES]: tmdbConfigured ?? false,
      [MediaTypeEnum.MANGA]: true,
      [MediaTypeEnum.GAME]: igdbConfigured ?? false,
      [MediaTypeEnum.BOOK]: true,
      [MediaTypeEnum.MUSIC]: true,
    },
    isLoading: isLoadingTmdb || isLoadingIgdb,
  };
}
