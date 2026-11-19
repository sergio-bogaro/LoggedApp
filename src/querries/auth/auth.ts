import { apiFetch } from "@/lib/http";

export interface UserRegister {
  username: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

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
  trackMusic: boolean;
  trackSeries: boolean;
}

export interface LoginResponse {
  user: User;
  message: string;
}

/** Chaves write-only, nunca retornadas pela API. Campo vazio ("") limpa a chave. */
export interface UserSecrets {
  tmdbApiKey?: string;
  igdbClientId?: string;
  igdbClientSecret?: string;
}

export type IntegrationSource = "user" | "instance" | "none";

export interface IntegrationEntry {
  configured: boolean;
  source: IntegrationSource;
}

export interface IntegrationStatus {
  tmdb: IntegrationEntry;
  igdb: IntegrationEntry;
}

export const authApi = {
  async register(data: UserRegister): Promise<User> {
    return apiFetch<User>("/auth/register", { method: "POST", body: data });
  },

  async login(data: UserLogin): Promise<LoginResponse> {
    return apiFetch<LoginResponse>("/auth/login", { method: "POST", body: data });
  },

  async getUser(userId: number): Promise<User> {
    return apiFetch<User>(`/auth/users/${userId}`);
  },

  async updateUser(userId: number, data: Partial<User> | UserSecrets): Promise<User> {
    return apiFetch<User>(`/auth/users/${userId}`, { method: "PUT", body: data });
  },
};

const EMPTY_INTEGRATION: IntegrationEntry = { configured: false, source: "none" };

export const integrationsApi = {
  async getStatus(userId: number): Promise<IntegrationStatus> {
    const [tmdb, igdb] = await Promise.all([
      apiFetch<IntegrationEntry>(`/api/tmdb/config?user_id=${userId}`).catch(
        () => EMPTY_INTEGRATION
      ),
      apiFetch<IntegrationEntry>(`/api/igdb/config?user_id=${userId}`).catch(
        () => EMPTY_INTEGRATION
      ),
    ]);

    return { tmdb, igdb };
  },
};
