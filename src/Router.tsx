import { Routes, Route } from "react-router";

import ProtectedRoute from "./components/ProtectedRoute";
import InternalLayout from "./layouts/internal";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import BacklogPage from "./pages/media/backlog/BacklogPage";
import MediaDetailsPage from "./pages/media/details";
import FavoritesPage from "./pages/media/favorites/FavoritesPage";
import MediaHomePage from "./pages/media/home";
import MediaListPage from "./pages/media/list";
import MediaSearchPage from "./pages/media/search";
import SettingsPage from "./pages/settings";
import WelcomePage from "./pages/welcome";

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/media"
        element={
          <ProtectedRoute>
            <InternalLayout />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<MediaHomePage />} />
        <Route path="list" element={<MediaListPage />} />
        <Route path="list/:type" element={<MediaListPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="backlog" element={<BacklogPage />} />

        <Route path=":mediaType">
          <Route path="details/:id" element={<MediaDetailsPage />} />
        </Route>
      </Route>

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <InternalLayout />
          </ProtectedRoute>
        }
      >
        <Route path="" element={<SettingsPage />} />
      </Route>

      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <InternalLayout />
          </ProtectedRoute>
        }
      >
        <Route path="" element={<MediaSearchPage />} />
      </Route>
    </Routes>
  );
} 