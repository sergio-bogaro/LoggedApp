/* eslint-disable no-undef */
import path from "path"

import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router"],
          state: ["@reduxjs/toolkit", "react-redux", "@tanstack/react-query"],
          i18n: [
            "i18next",
            "react-i18next",
            "i18next-http-backend",
            "i18next-browser-languagedetector",
          ],
          charts: ["chart.js", "react-chartjs-2"],
        },
      },
    },
  },
  server: {
    hmr: {
      host: "localhost"
    },
    proxy: {
      "/anytype-api": {
        target: "http://127.0.0.1:31009",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/anytype-api/, "/v1")
      }
    }
  }
})
