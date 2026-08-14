import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark" | "test" | "rose-pine" | "rose-pine-dawn" | "green-light" | "green-dark";
export type ViewMode = "list" | "grid";
export type RatingMode = "numeric" | "stars5" | "stars10";
export type Crumb = {
  label: string;
  to?: string;
};

export const THEME_CLASSES = ["light", "dark", "test", "rose-pine", "rose-pine-dawn", "green-light", "green-dark"] as const;

interface UIState {
  theme: Theme;
  viewMode: ViewMode;
  ratingMode: RatingMode;
  lastSearchType: string;
  breadcrumbs: Crumb[];
}

const savedTheme = (localStorage.getItem("theme") as Theme) || "light";
const savedViewMode = (localStorage.getItem("viewMode") as ViewMode) || "list";
const savedRatingMode = (localStorage.getItem("ratingMode") as RatingMode) || "stars5";
const savedLastSearchType = localStorage.getItem("lastSearchType") || "movies";

document.documentElement.classList.remove(...THEME_CLASSES);
document.documentElement.classList.add(savedTheme);

const initialState: UIState = {
  theme: savedTheme,
  viewMode: savedViewMode,
  ratingMode: savedRatingMode,
  lastSearchType: savedLastSearchType,
  breadcrumbs: [],
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);

      document.documentElement.classList.remove(...THEME_CLASSES);
      document.documentElement.classList.add(action.payload);
    },

    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
      localStorage.setItem("viewMode", action.payload);
    },

    setRatingMode: (state, action: PayloadAction<RatingMode>) => {
      state.ratingMode = action.payload;
      localStorage.setItem("ratingMode", action.payload);
    },

    setLastSearchType: (state, action: PayloadAction<string>) => {
      state.lastSearchType = action.payload;
      localStorage.setItem("lastSearchType", action.payload);
    },

    setBreadcrumbs: (state, action: PayloadAction<Crumb[]>) => {
      state.breadcrumbs = action.payload;
    },
  },
});

export const { setTheme, setViewMode, setRatingMode, setLastSearchType, setBreadcrumbs } = uiSlice.actions;
export default uiSlice.reducer;