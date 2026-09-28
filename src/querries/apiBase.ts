/**
 * Base URL única da API do backend.
 *
 * Respeita `VITE_API_BASE_URL`:
 *  - definida e vazia ("")  → URLs relativas (mesma origem, ideal atrás do Nginx);
 *  - ausente (undefined)    → cai para o dev server local como padrão.
 *
 * Use este módulo em vez de redeclarar a constante em cada arquivo.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
