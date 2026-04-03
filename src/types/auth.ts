export interface User {
  id: number;
  username: string;
  createdAt: string;
  updatedAt: string;
  ratingMode: "numeric" | "stars5" | "stars10";
  viewMode: "list" | "grid";
  trackMovies: boolean;
  trackAnime: boolean;
  trackManga: boolean;
  trackGames: boolean;
  trackBooks: boolean;
}

export interface UserCreate {
  username: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  message: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
