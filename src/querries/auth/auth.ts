const API_BASE_URL = "http://localhost:8000";

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
}

export interface LoginResponse {
  user: User;
  message: string;
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

  async updateUser(userId: number, data: Partial<User>): Promise<User> {
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
