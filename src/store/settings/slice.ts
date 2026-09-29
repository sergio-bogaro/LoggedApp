import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { MediaTypeEnum } from "@/types/media";

export type Theme =
  | "light"
  | "dark"
  | "purple-light"
  | "purple-dark"
  | "green-light"
  | "green-dark";
export type ViewMode = "list" | "grid";
export type RatingMode = "numeric" | "stars5" | "stars10";
export type Crumb = {
  label: string;
  to?: string;
};

export const ALL_THEMES: Theme[] = [
  "light",
  "dark",
  "purple-light",
  "purple-dark",
  "green-light",
  "green-dark",
];

/* Classes applied to <html>: one mode class (light/dark) plus an optional
   palette class (purple/green) that overrides only the accent tokens. */
export const THEME_CLASSES = ["light", "dark", "purple", "green"] as const;

const THEME_MODE: Record<Theme, "light" | "dark"> = {
  light: "light",
  dark: "dark",
  "purple-light": "light",
  "purple-dark": "dark",
  "green-light": "light",
  "green-dark": "dark",
};

const THEME_PALETTE: Record<Theme, "purple" | "green" | null> = {
  light: null,
  dark: null,
  "purple-light": "purple",
  "purple-dark": "purple",
  "green-light": "green",
  "green-dark": "green",
};

export function applyThemeClasses(theme: Theme) {
  const root = document.documentElement.classList;
  root.remove(...THEME_CLASSES);
  root.add(THEME_MODE[theme]);

  const palette = THEME_PALETTE[theme];
  if (palette) root.add(palette);
}

/*
 * Themes dropped in earlier redesigns. A stored value under an old name is
 * mapped onto its closest surviving counterpart so existing users keep a
 * usable theme.
 */
const LEGACY_THEME_MAP: Record<string, Theme> = {
  "rose-pine": "dark",
  "rose-pine-dawn": "light",
};

function resolveStoredTheme(): Theme {
  const stored = localStorage.getItem("theme");
  if (!stored) return "light";
  if ((ALL_THEMES as string[]).includes(stored)) return stored as Theme;
  return LEGACY_THEME_MAP[stored] ?? "light";
}

interface UIState {
  theme: Theme;
  /** Search results — kept apart from "libraryViewMode". */
  viewMode: ViewMode;
  /** Home log and the collection pages — kept apart from search's "viewMode". */
  libraryViewMode: ViewMode;
  ratingMode: RatingMode;
  lastSearchType: string;
  breadcrumbs: Crumb[];
  /** `null` means "not chosen yet" (all available types). */
  mediaTypeFilter: MediaTypeEnum[] | null;
}

const savedTheme = resolveStoredTheme();
localStorage.setItem("theme", savedTheme);
const savedViewMode = (localStorage.getItem("viewMode") as ViewMode) || "list";
const savedLibraryViewMode = (localStorage.getItem("libraryViewMode") as ViewMode) || "list";
const savedRatingMode = (localStorage.getItem("ratingMode") as RatingMode) || "stars5";
const savedLastSearchType = localStorage.getItem("lastSearchType") || "movies";

function resolveStoredMediaTypeFilter(): MediaTypeEnum[] | null {
  try {
    const raw = localStorage.getItem("mediaTypeFilter");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MediaTypeEnum[]) : null;
  } catch {
    return null;
  }
}

const savedMediaTypeFilter = resolveStoredMediaTypeFilter();

applyThemeClasses(savedTheme);

const initialState: UIState = {
  theme: savedTheme,
  viewMode: savedViewMode,
  libraryViewMode: savedLibraryViewMode,
  ratingMode: savedRatingMode,
  lastSearchType: savedLastSearchType,
  breadcrumbs: [],
  mediaTypeFilter: savedMediaTypeFilter,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);

      applyThemeClasses(action.payload);
    },

    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
      localStorage.setItem("viewMode", action.payload);
    },

    setLibraryViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.libraryViewMode = action.payload;
      localStorage.setItem("libraryViewMode", action.payload);
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

    setMediaTypeFilter: (state, action: PayloadAction<MediaTypeEnum[] | null>) => {
      state.mediaTypeFilter = action.payload;

      if (action.payload === null) {
        localStorage.removeItem("mediaTypeFilter");
      } else {
        localStorage.setItem("mediaTypeFilter", JSON.stringify(action.payload));
      }
    },
  },
});

export const { setTheme, setViewMode, setLibraryViewMode, setRatingMode, setLastSearchType, setBreadcrumbs, setMediaTypeFilter } = uiSlice.actions;
export default uiSlice.reducer;