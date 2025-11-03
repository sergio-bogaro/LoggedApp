import { Routes, Route } from "react-router";

import MediaDetailsPage from "./pages/mediaDetails";
import SearchMoviesPage from "./pages/movies/search";
import WelcomePage from "./pages/welcome";

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />

      <Route path="logger" >
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