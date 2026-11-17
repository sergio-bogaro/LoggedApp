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
  updatesPerDay: number;
  username?: string | null;
  token?: string | null;
  clientId?: string | null;
  clearAuth?: boolean;
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
