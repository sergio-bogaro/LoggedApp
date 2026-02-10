import { Routes, Route } from "react-router";

import InternalLayout from "./layouts/internal";
import MediaDetailsPage from "./pages/media/details";
import MediaHomePage from "./pages/media/home";
import MediaSearchPage from "./pages/media/search";
import SettingsPage from "./pages/settings";
import WelcomePage from "./pages/welcome";

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />

      <Route path="logger" element={<InternalLayout />}>
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