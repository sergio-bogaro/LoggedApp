import type {
  ImportCandidate,
  ImportCommitResponse,
  ImportLogEntry,
  ImportMatchStatus,
} from "./import";
import { MediaStatusEnum, MediaTypeEnum } from "./media";

export type ImportJobStatus =
  | "queued"
  | "parsing"
  | "matching"
  | "ready"
  | "done"
  | "failed"
  | "cancelled";

export interface ImportJobCounts {
  total: number;
  withLogs: number;
  rated: number;
  reviewed: number;
  backlog: number;
  matched: number;
  ambiguous: number;
  notFound: number;
  alreadyInLibrary: number;
  errors: number;
  ignored: number;
  selected: number;
}

export interface ImportJob {
  id: number;
  provider: string;
  mediaType?: MediaTypeEnum | null;
  inputType: "file" | "username" | "url";
  status: ImportJobStatus;
  progressDone: number;
  progressTotal: number;
  counts: Partial<ImportJobCounts>;
  summary?: ImportCommitResponse | null;
  error?: string | null;
  createdAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
}

export interface ImportJobItem {
  id: number;
  key: string;
  mediaType: MediaTypeEnum;
  title: string;
  year?: number | null;
  overview?: string | null;
  source: string;
  externalRefs: Record<string, string>;
  status?: MediaStatusEnum | null;
  rating?: number | null;
  review?: string | null;
  logs: ImportLogEntry[];
  inBacklog: boolean;
  backlogDate?: string | null;

  matchStatus?: ImportMatchStatus | "error" | null;
  match?: ImportCandidate | null;
  candidates: ImportCandidate[];
  existingMediaId?: number | null;
  matchError?: string | null;

  selected?: ImportCandidate | null;
  ignored: boolean;

  commitOutcome?: "imported" | "merged" | "skipped" | "failed" | null;
  commitReason?: string | null;
  logsCreated: number;
  backlogAdded: boolean;
}

export interface ImportJobItemsResponse {
  items: ImportJobItem[];
  total: number;
  offset: number;
  limit: number;
  counts: Record<string, number>;
}

export interface CreateImportJobInput {
  userId: number;
  providerId: string;
  mediaType?: MediaTypeEnum;
  username?: string;
  sourceUrl?: string;
  file?: File;
}
