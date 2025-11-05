import { Routes, Route } from "react-router";

import InternalLayout from "./layouts/internal";
import MediaDetailsPage from "./pages/mediaDetails";
import SearchMoviesPage from "./pages/movies/search";
import SettingsPage from "./pages/settings";
import WelcomePage from "./pages/welcome";

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />

      <Route path="logger" element={<InternalLayout />}>
        <Route path="settings" element={<SettingsPage />} />

        <Route path="movies">
          <Route path="search" element={<SearchMoviesPage />} />
        </Route>

        <Route path=":mediaType">
          <Route path="details/:id" element={<MediaDetailsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}