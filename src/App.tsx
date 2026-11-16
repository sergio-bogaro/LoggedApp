import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"
import { Provider } from "react-redux"
import { BrowserRouter, useLocation } from "react-router"

import { ErrorBoundary } from "./components/ErrorBoundary"
import { Toaster } from "./components/ui/sonner"
import { ApiError } from "./lib/apiError"
import { Router } from "./Router"
import { store } from "./store/settings/store"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // 4xx não melhora repetindo; erros de rede/5xx tentam mais uma vez.
        if (error instanceof ApiError && error.status < 500) return false;
        return failureCount < 1;
      },
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-right"
          closeButton
        />
        <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  )
}

export default App;