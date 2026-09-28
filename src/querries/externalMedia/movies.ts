import { API_BASE_URL } from "@/querries/apiBase";
import { MediaItem, MediaTypeEnum } from "@/types/media";

export async function searchMoviesNormalized(query: string, userId?: number): Promise<MediaItem[]> {
  const movies = await searchMovies(query, userId);

  return movies.map((m) => ({
    id: String(m.id),
    title: m.title,
    coverUrl: tmdbPosterUrl(m.poster_path) ?? "",
    year: m.release_date ? m.release_date.slice(0, 4) : undefined,
    releaseDate: m.release_date,
    type: MediaTypeEnum.MOVIES,
    description: m.overview,
    provider: "tmdb",
    raw: m,
  }));
}
export type Movie = {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
};

export type SearchMoviesResponse = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};

export type TMDBGenre = {
  id: number;
  name: string;
};

export type TMDBCastMember = {
  cast_id?: number;
  character?: string;
  credit_id: string;
  gender?: number | null;
  id: number;
  name: string;
  order?: number;
  profile_path?: string | null;
};

export type TMDBCrewMember = {
  credit_id: string;
  department?: string;
  gender?: number | null;
  id: number;
  job?: string;
  name: string;
  profile_path?: string | null;
};

export type TMDBCredits = {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
};

export type TMDBVideo = {
  id: string;
  iso_639_1?: string;
  iso_3166_1?: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
};

export type TMDBVideos = {
  results: TMDBVideo[];
};

export type TMDBImage = {
  aspect_ratio?: number;
  file_path: string;
  height?: number;
  iso_639_1?: string | null;
  vote_average?: number;
  vote_count?: number;
  width?: number;
};

export type TMDBImages = {
  backdrops: TMDBImage[];
  posters: TMDBImage[];
};

export type TMDBRecommendations = {
  page?: number;
  results: Movie[];
  total_pages?: number;
  total_results?: number;
};

export type TMDBMovieDetails = {
  adult?: boolean;
  backdrop_path?: string | null;
  belongs_to_collection?: unknown | null;
  budget?: number;
  genres?: TMDBGenre[];
  homepage?: string | null;
  id: number;
  imdb_id?: string | null;
  original_language?: string;
  original_title?: string;
  overview?: string | null;
  popularity?: number;
  poster_path?: string | null;
  production_companies?: Array<{ id: number; name: string; logo_path?: string | null; origin_country?: string }>;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  release_date?: string;
  revenue?: number;
  runtime?: number | null;
  spoken_languages?: Array<{ iso_639_1?: string; name?: string }>;
  status?: string;
  tagline?: string | null;
  title?: string;
  video?: boolean;
  vote_average?: number;
  vote_count?: number;
  credits?: TMDBCredits;
  videos?: TMDBVideos;
  images?: TMDBImages;
  recommendations?: TMDBRecommendations;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const API = API_BASE_URL;

export async function searchMovies(query: string, userId?: number): Promise<Movie[]> {
  const params = new URLSearchParams({ query });
  if (userId !== undefined) params.set("user_id", String(userId));

  const res = await fetch(`${API}/api/tmdb/search?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB API error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as SearchMoviesResponse;
  return data.results || [];
}

export function tmdbPosterUrl(path: string | null | undefined, size = "w200") {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export async function getMovieDetails(id: number, userId?: number): Promise<TMDBMovieDetails> {
  const params = userId !== undefined ? `?user_id=${userId}` : "";
  const res = await fetch(`${API}/api/tmdb/movie/${id}${params}`);
  if (!res.ok) throw new Error("TMDB details error");
  const data = (await res.json()) as TMDBMovieDetails;
  return data;
}
