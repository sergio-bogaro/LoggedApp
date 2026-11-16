import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Routes, Route } from "react-router";

import ProtectedRoute from "./components/ProtectedRoute";
import InternalLayout from "./layouts/internal";

const LoginPage = lazy(() => import("./pages/auth/login"));
const RegisterPage = lazy(() => import("./pages/auth/register"));
const ImportPage = lazy(() => import("./pages/import"));
const BacklogPage = lazy(() => import("./pages/media/backlog/BacklogPage"));
const MediaDetailsPage = lazy(() => import("./pages/media/details"));
const FavoritesPage = lazy(() => import("./pages/media/favorites/FavoritesPage"));
const MediaHomePage = lazy(() => import("./pages/media/home"));
const MediaListPage = lazy(() => import("./pages/media/list"));
const MediaLogsPage = lazy(() => import("./pages/media/logs"));
const MediaSearchPage = lazy(() => import("./pages/media/search"));
const ViewsHubPage = lazy(() => import("./pages/media/views"));
const MediaCollectionPage = lazy(() => import("./pages/media/views/collection"));
const NotFoundPage = lazy(() => import("./pages/notFound"));
const OnboardingPage = lazy(() => import("./pages/onboarding"));
const SettingsPage = lazy(() => import("./pages/settings"));
const WelcomePage = lazy(() => import("./pages/welcome"));

export function Router() {
  const { t } = useTranslation("common");

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-step-1 text-muted-foreground">
          {t("a11y.loading")}
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/media"
          element={
            <ProtectedRoute>
              <InternalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<MediaHomePage />} />
          <Route path="list" element={<MediaListPage />} />
          <Route path="list/:type" element={<MediaListPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="backlog" element={<BacklogPage />} />
          <Route path="logs" element={<MediaLogsPage />} />
          <Route path="logs/:type" element={<MediaLogsPage />} />
          <Route path="views" element={<ViewsHubPage />} />
          <Route path="views/:key" element={<MediaCollectionPage />} />

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
          path="/import"
          element={
            <ProtectedRoute>
              <InternalLayout />
            </ProtectedRoute>
          }
        >
          <Route path="" element={<ImportPage />} />
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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
} 