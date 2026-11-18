import type { ImportCandidate, ImportLogEntry } from "./import";
import type { MediaStatusEnum, MediaTypeEnum } from "./media";

export type ReviewSource = "manual" | "sync";
export type ReviewState = "pending" | "approved" | "dismissed" | "failed";
export type ReviewMatch =
  | "ready"
  | "needs_validation"
  | "no_match"
  | "already_in_library";

export interface ReviewItem {
  key: string;
  source: ReviewSource;
  provider: string;
  mediaType: MediaTypeEnum;
  title: string;
  year?: number | null;
  overview?: string | null;
  sourceUrl?: string | null;
  coverUrl?: string | null;
  externalRefs: Record<string, string>;
  action: string;
  targetStatus?: MediaStatusEnum | null;
  rating?: number | null;
  review?: string | null;
  watchedDate?: string | null;
  logs: ImportLogEntry[];
  inBacklog: boolean;
  backlogDate?: string | null;
  candidate?: ImportCandidate | null;
  candidates: ImportCandidate[];
  selected?: ImportCandidate | null;
  match: ReviewMatch;
  error?: string | null;
  state: ReviewState;
  ignored: boolean;
  jobId?: number | null;
  jobStatus?: string | null;
  syncRunAt?: string | null;
  origin: string;
  commitOutcome?: string | null;
  commitReason?: string | null;
  logsCreated: number;
  backlogAdded: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ReviewCounts {
  pending: number;
  approved: number;
  dismissed: number;
  failed: number;
  ready: number;
  needsValidation: number;
  noMatch: number;
  alreadyInLibrary: number;
  manualJobs: number;
  syncItems: number;
  pendingTasks: number;
}

export interface ReviewItemsResponse {
  items: ReviewItem[];
  total: number;
  counts: ReviewCounts;
  offset: number;
  limit: number;
}

export interface ReviewCommitResult {
  key: string;
  source: ReviewSource;
  outcome: string;
  reason?: string | null;
  logsCreated: number;
  backlogAdded: boolean;
}

export interface ReviewCommitFailure {
  name: string;
  reason: string;
}

export interface ReviewCommitResponse {
  imported: number;
  merged: number;
  skipped: number;
  failed: number;
  logsCreated: number;
  backlogAdded: number;
  items: ReviewCommitResult[];
  failures: ReviewCommitFailure[];
}

export interface ReviewItemPatch {
  userId: number;
  selected?: ImportCandidate | null;
  ignored?: boolean | null;
}

export interface ReviewItemsParams {
  state?: ReviewState | "all";
  match?: ReviewMatch | "all";
  source?: ReviewSource | "all";
  provider?: string;
  mediaType?: MediaTypeEnum;
  search?: string;
  offset?: number;
  limit?: number;
}
