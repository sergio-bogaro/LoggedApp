import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router"

import { Toaster } from "./components/ui/sonner"
import { Router } from "./Router"
import { store } from "./store/settings/store"

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-right"
          closeButton
        />
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  )
}

export default App;