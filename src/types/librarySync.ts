import type { ImportCandidate } from "./import";
import type { MediaStatusEnum, MediaTypeEnum } from "./media";

export type SyncAction =
  | "ignore"
  | "backlog"
  | "in_progress"
  | "following"
  | "on_hold"
  | "finished"
  | "dropped";

export interface SyncProviderInfo {
  id: string;
  label: string;
  mediaTypes: MediaTypeEnum[];
  authKind: "username" | "token" | "oauth";
  connected: boolean;
  account?: string | null;
  enabled: boolean;
  updatesPerDay: number;
  baselineCompletedAt?: string | null;
  lastSyncAt?: string | null;
  lastSyncStatus?: string | null;
  lastSyncSummary?: Record<string, unknown> | null;
  nextSyncAt?: string | null;
  needsReauth: boolean;
  username?: string | null;
  clientId?: string | null;
  hasToken: boolean;
  pendingReview: number;
}

export interface SyncStatusOption {
  sourceStatus: string;
  sourceLabel: string;
  action: SyncAction;
  status?: MediaStatusEnum | null;
  position: number;
}

export interface SyncStatusesResponse {
  statuses: SyncStatusOption[];
}

export interface SyncConfigPayload {
  userId: number;
  enabled: boolean;
  updatesPerDay?: number;
  username?: string | null;
  token?: string | null;
  clientId?: string | null;
  clearAuth?: boolean;
}

export interface GlobalSyncSettings {
  enabled: boolean;
  updatesPerDay: number;
  startTime: string;
  lastSyncAt?: string | null;
  lastSyncStatus?: string | null;
  lastSyncSummary?: Record<string, unknown> | null;
  nextSyncAt?: string | null;
}

export interface GlobalSyncConfigPayload {
  userId: number;
  enabled: boolean;
  updatesPerDay: number;
  startTime: string;
}

export interface GlobalSyncResultItem {
  provider: string;
  status: string;
  summary?: Record<string, unknown> | null;
  error?: string | null;
}

export interface GlobalSyncResponse {
  status: string;
  results: GlobalSyncResultItem[];
  ok: number;
  failed: number;
}

export interface OAuthStartResponse {
  userCode?: string | null;
  verificationUrl?: string | null;
  expiresIn: number;
  interval: number;
}

export interface OAuthPollResponse {
  status: string;
  account?: string | null;
  error?: string | null;
}

export interface SyncResponse {
  status: string;
  summary: Record<string, unknown>;
}


export type SyncSuggestionState = "pending" | "approved" | "dismissed";

export interface SyncSuggestion {
  id: number;
  provider: string;
  sourceId: string;
  mediaType: MediaTypeEnum;
  title: string;
  year?: number | null;
  sourceStatus: string;
  sourceLabel: string;
  action: SyncAction;
  targetStatus?: MediaStatusEnum | null;
  rating?: number | null;
  review?: string | null;
  watchedDate?: string | null;
  candidate?: ImportCandidate | null;
  sourceUrl?: string | null;
  reviewState: SyncSuggestionState;
  mediaId?: number | null;
  error?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SyncSuggestionCounts {
  pending: number;
  approved: number;
  dismissed: number;
}

export interface SyncSuggestionsResponse {
  items: SyncSuggestion[];
  total: number;
  counts: SyncSuggestionCounts;
}

export interface SyncSuggestionCountResponse {
  pending: number;
}

export interface SyncSuggestionsApproveResponse {
  approved: number;
  failed: number;
  failures: { name: string; reason: string }[];
}
