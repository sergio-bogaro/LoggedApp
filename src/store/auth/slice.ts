import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { User } from "../../types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const savedUser = (() => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<User> | null;
    if (!parsed || typeof parsed.id !== "number" || typeof parsed.username !== "string") {
      localStorage.removeItem("user");
      return null;
    }
    return parsed as User;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
})();

const initialState: AuthState = {
  user: savedUser,
  isAuthenticated: !!savedUser,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
    },

    updateUserSettings: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
});

export const { setUser, logout, updateUserSettings } = authSlice.actions;
export default authSlice.reducer;
