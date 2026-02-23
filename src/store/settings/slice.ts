import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark" | "test";
export type ViewMode = "list" | "grid";
export type RatingMode = "numeric" | "stars5" | "stars10";

interface UIState {
  theme: Theme;
  viewMode: ViewMode;
  ratingMode: RatingMode;
}

const savedTheme = (localStorage.getItem("theme") as Theme) || "light";
const savedViewMode = (localStorage.getItem("viewMode") as ViewMode) || "list";
const savedRatingMode = (localStorage.getItem("ratingMode") as RatingMode) || "stars5";

document.documentElement.classList.remove("light", "dark", "test");
document.documentElement.classList.add(savedTheme);

const initialState: UIState = {
  theme: savedTheme,
  viewMode: savedViewMode,
  ratingMode: savedRatingMode,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);

      document.documentElement.classList.remove("light", "dark", "test");
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
  },
});

export const { setTheme, setViewMode, setRatingMode } = uiSlice.actions;
export default uiSlice.reducer;