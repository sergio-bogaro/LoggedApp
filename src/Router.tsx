import { Routes, Route } from "react-router";

import ProtectedRoute from "./components/ProtectedRoute";
import InternalLayout from "./layouts/internal";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import MediaDetailsPage from "./pages/media/details";
import MediaHomePage from "./pages/media/home";
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
        path="logger"
        element={
          <ProtectedRoute>
            <InternalLayout />
          </ProtectedRoute>
        }
      >
        <Route path="" element={<MediaHomePage />} />

        <Route path="settings" element={<SettingsPage />} />

        <Route path="search" element={<MediaSearchPage />} />

        <Route path=":mediaType">
          <Route path="details/:id" element={<MediaDetailsPage />} />
        </Route>
      </Route>
    </Routes>
  );
} 