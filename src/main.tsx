import "@fontsource-variable/archivo/wght.css";
import "@fontsource-variable/newsreader/opsz-italic.css";
import "@fontsource-variable/newsreader/opsz.css";
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./i18n/i18n"
import "./index.css"

import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
