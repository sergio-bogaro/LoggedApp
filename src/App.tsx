import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'

import LanguageSwitcher from './components/LanguageSwitcher'
import  ThemeSwitcher from './components/ThemeSwitcher'
import { Router } from './Router'
import { store } from './store/settings/store'

const queryClient = new QueryClient();



function AppContent() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="fixed top-4 right-4 flex flex-col gap-4">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-4">{t('common.welcome')}</h1>
        {/* Your app content goes here */}
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </QueryClientProvider>  
    </Provider>
  )
}

export default App;