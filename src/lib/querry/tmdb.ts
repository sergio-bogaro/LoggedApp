import { MediaItem } from "@/types/mediaItem";
import { MediaTypeEnum } from "@/utils/mediaText";

export async function searchMoviesNormalized(query: string): Promise<MediaItem[]> {
  const movies = await searchMovies(query);

  return movies.map((m) => ({
    id: String(m.id),
    title: m.title,
    coverUrl: tmdbPosterUrl(m.poster_path) || undefined,
    year: m.release_date ? m.release_date.slice(0, 4) : undefined,
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
  [key: string]: any;
};

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export async function searchMovies(query: string): Promise<Movie[]> {
  const url = new URL(`${TMDB_BASE}/search/movie`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("query", query);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("page", "1");

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB API error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as SearchMoviesResponse;
  return data.results || [];
}

export function tmdbPosterUrl(path: string | null | undefined, size = "w200") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export async function getMovieDetails(id: number): Promise<TMDBMovieDetails> {
  const res = await fetch(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos,images,recommendations`);
  if (!res.ok) throw new Error("TMDB details error");
  const data = (await res.json()) as TMDBMovieDetails;
  return data;
}
