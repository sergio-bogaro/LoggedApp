export type SuwayomiAction =
  | "ignore"
  | "backlog"
  | "in_progress"
  | "following"
  | "on_hold"
  | "finished"
  | "dropped";

export interface SuwayomiSyncChange {
  suwayomiId?: number;
  title: string;
  from?: string | null;
  to: string;
}

export interface SuwayomiSyncSummary {
  status?: string;
  startedAt?: string;
  finishedAt?: string | null;
  library?: number;
  processed?: number;
  created?: number;
  statusUpdated?: number;
  backlogAdded?: number;
  backlogRemoved?: number;
  logsCreated?: number;
  datedItems?: number;
  ignoredSkipped?: number;
  unmatched?: { title: string; reason?: string }[];
  removed?: string[];
  pendingResolved?: string[];
  changes?: SuwayomiSyncChange[];
  errors?: string[];
  error?: string;
}

export interface SuwayomiConfig {
  configured: boolean;
  baseUrl?: string | null;
  username?: string | null;
  hasPassword: boolean;
  enabled: boolean;
  updatesPerDay: number;
  lastSyncAt?: string | null;
  lastSyncStatus?: string | null;
  lastSyncSummary?: SuwayomiSyncSummary | null;
  nextSyncAt?: string | null;
}

export interface SuwayomiConfigPayload {
  userId: number;
  baseUrl: string;
  username?: string;
  password?: string;
  clearAuth?: boolean;
  enabled: boolean;
  updatesPerDay: number;
}

export interface SuwayomiCategory {
  id: number;
  name: string;
  order: number;
  default: boolean;
  mangaCount?: number | null;
  action: SuwayomiAction;
  mapped: boolean;
}

export interface SuwayomiCategoriesResponse {
  categories: SuwayomiCategory[];
  stale: boolean;
  error?: string | null;
}

export interface SuwayomiCategoryPayload {
  categoryId: number;
  categoryName: string;
  action: SuwayomiAction;
  categoryOrder?: number;
}

export interface SuwayomiTestResponse {
  ok: boolean;
  serverName?: string | null;
  version?: string | null;
  error?: string | null;
}

export interface SuwayomiSyncResponse {
  status: string;
  summary: SuwayomiSyncSummary;
}

export type SuwayomiLinkStatus = "pending" | "ignored" | "all";

export interface SuwayomiLink {
  id: number;
  suwayomiMangaId: number;
  mediaId?: number | null;
  title: string;
  ignored: boolean;
  matchError?: string | null;
  matchAttempts: number;
  lastMatchAttemptAt?: string | null;
  lastSeenAt?: string | null;
}

export interface SuwayomiLinkUpdate {
  mediaId?: number;
  ignored?: boolean;
}
