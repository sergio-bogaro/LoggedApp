import { API_BASE_URL } from "@/querries/apiBase";
import { TMDBCredits, TMDBCrewMember, TMDBGenre, TMDBImages, TMDBVideos, tmdbPosterUrl } from "@/querries/externalMedia/movies";
import { MediaItem, MediaTypeEnum } from "@/types/media";

export type TMDBTvSummary = {
  id: number;
  name: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
};

export type SearchTvResponse = {
  page: number;
  results: TMDBTvSummary[];
  total_pages: number;
  total_results: number;
};

export type TMDBTvCreatedBy = {
  id: number;
  credit_id?: string;
  name: string;
  gender?: number | null;
  profile_path?: string | null;
};

export type TMDBTvNetwork = {
  id: number;
  logo_path?: string | null;
  name: string;
  origin_country?: string;
};

export type TMDBTvSeason = {
  air_date?: string | null;
  episode_count: number;
  id: number;
  name: string;
  overview?: string;
  poster_path?: string | null;
  season_number: number;
  vote_average?: number;
};

export type TMDBTvCastRole = {
  credit_id: string;
  character: string;
  episode_count: number;
};

export type TMDBTvAggregateCastMember = {
  id: number;
  name: string;
  original_name?: string;
  profile_path?: string | null;
  order?: number;
  roles?: TMDBTvCastRole[];
  total_episode_count?: number;
};

export type TMDBTvAggregateCredits = {
  cast: TMDBTvAggregateCastMember[];
  crew?: TMDBCrewMember[];
};

export type TMDBTvRecommendations = {
  page?: number;
  results: TMDBTvSummary[];
  total_pages?: number;
  total_results?: number;
};

export type TMDBTvDetails = {
  adult?: boolean;
  backdrop_path?: string | null;
  created_by?: TMDBTvCreatedBy[];
  episode_run_time?: number[];
  first_air_date?: string;
  genres?: TMDBGenre[];
  homepage?: string | null;
  id: number;
  in_production?: boolean;
  last_air_date?: string | null;
  name: string;
  networks?: TMDBTvNetwork[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  origin_country?: string[];
  original_language?: string;
  original_name?: string;
  overview?: string | null;
  popularity?: number;
  poster_path?: string | null;
  production_companies?: Array<{ id: number; name: string; logo_path?: string | null; origin_country?: string }>;
  seasons?: TMDBTvSeason[];
  status?: string;
  tagline?: string | null;
  type?: string;
  vote_average?: number;
  vote_count?: number;
  credits?: TMDBCredits;
  aggregate_credits?: TMDBTvAggregateCredits;
  videos?: TMDBVideos;
  images?: TMDBImages;
  recommendations?: TMDBTvRecommendations;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const API = API_BASE_URL;

export async function searchSeriesNormalized(query: string, userId?: number): Promise<MediaItem[]> {
  const series = await searchSeries(query, userId);

  return series.map((s) => ({
    id: String(s.id),
    title: s.name,
    coverUrl: tmdbPosterUrl(s.poster_path) ?? "",
    year: s.first_air_date ? s.first_air_date.slice(0, 4) : undefined,
    releaseDate: s.first_air_date,
    type: MediaTypeEnum.SERIES,
    description: s.overview,
    provider: "tmdb",
    raw: s,
  }));
}

export async function searchSeries(query: string, userId?: number): Promise<TMDBTvSummary[]> {
  const params = new URLSearchParams({ query });
  if (userId !== undefined) params.set("user_id", String(userId));

  const res = await fetch(`${API}/api/tmdb/search/tv?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB API error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as SearchTvResponse;
  return data.results || [];
}

export async function getSeriesDetails(id: number, userId?: number): Promise<TMDBTvDetails> {
  const params = userId !== undefined ? `?user_id=${userId}` : "";
  const res = await fetch(`${API}/api/tmdb/tv/${id}${params}`);
  if (!res.ok) throw new Error("TMDB details error");
  const data = (await res.json()) as TMDBTvDetails;
  return data;
}
