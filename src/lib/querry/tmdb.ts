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

const TMDB_BASE = "https://api.themoviedb.org/3";

function getApiKey(): string | null {
  return "c1a60ca480f0e9455068980a65bafa08"

  // try {
  //   return localStorage.getItem("TMDB_API_KEY");
  // } catch {
  //   return null;
  // }
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('TMDB API key not found in localStorage under "TMDB_API_KEY"');
  const url = new URL(`${TMDB_BASE}/search/movie`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("query", query);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("page", "1");

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB API error: ${res.status} ${text}`);
  }
  const data = await res.json();
  return (data.results || []) as Movie[];
}

export function tmdbPosterUrl(path: string | null | undefined, size = "w200") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export async function getMovieDetails(id: number) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("TMDB API key not found in localStorage");

  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US&append_to_response=credits,videos,images,recommendations`);
  if (!res.ok) throw new Error("TMDB details error");
  return res.json();
}
