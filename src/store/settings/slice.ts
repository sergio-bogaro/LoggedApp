import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark" | "test";
export type ViewMode = "list" | "grid";

interface UIState {
  theme: Theme;
  viewMode: ViewMode;
}

const savedTheme = (localStorage.getItem("theme") as Theme) || "light";
const savedViewMode = (localStorage.getItem("viewMode") as ViewMode) || "list";

document.documentElement.classList.remove("light", "dark", "test");
document.documentElement.classList.add(savedTheme);

const initialState: UIState = {
  theme: savedTheme,
  viewMode: savedViewMode,
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
  },
});

export const { setTheme, setViewMode } = uiSlice.actions;
export default uiSlice.reducer;