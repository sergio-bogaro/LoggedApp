import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"
import { Provider } from "react-redux"
import { BrowserRouter, useLocation } from "react-router"

import { Toaster } from "./components/ui/sonner"
import { Router } from "./Router"
import { store } from "./store/settings/store"

const queryClient = new QueryClient();

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
          <Router />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  )
}

export default App;