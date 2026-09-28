import { API_BASE_URL } from "@/querries/apiBase";

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
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }

    return response.json();
  },

  async login(data: UserLogin): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    return response.json();
  },

  async getUser(userId: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch user");
    }

    return response.json();
  },

  async updateUser(userId: number, data: Partial<User> | UserSecrets): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update user");
    }

    return response.json();
  },
};

const EMPTY_INTEGRATION: IntegrationEntry = { configured: false, source: "none" };

export const integrationsApi = {
  async getStatus(userId: number): Promise<IntegrationStatus> {
    const [tmdb, igdb] = await Promise.all([
      fetch(`${API_BASE_URL}/api/tmdb/config?user_id=${userId}`)
        .then((r) => (r.ok ? r.json() : EMPTY_INTEGRATION))
        .catch(() => EMPTY_INTEGRATION),
      fetch(`${API_BASE_URL}/api/igdb/config?user_id=${userId}`)
        .then((r) => (r.ok ? r.json() : EMPTY_INTEGRATION))
        .catch(() => EMPTY_INTEGRATION),
    ]);

    return { tmdb, igdb };
  },
};
