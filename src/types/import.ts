import { MediaStatusEnum, MediaTypeEnum } from "./media";

export type ImportProviderInfo = {
  id: string;
  label: string;
  mediaTypes: MediaTypeEnum[];
  inputType: "file" | "username";
  accepts?: string | null;
};

export type ImportLogEntry = {
  date: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: MediaStatusEnum | null;
  rating?: number | null;
  review?: string | null;
};

export type ImportEntry = {
  key: string;
  mediaType: MediaTypeEnum;
  title: string;
  year?: number | null;
  source: string;
  externalRefs: Record<string, string>;
  status?: MediaStatusEnum | null;
  rating?: number | null;
  review?: string | null;
  logs: ImportLogEntry[];
  inBacklog: boolean;
  backlogDate?: string | null;
};

export type ImportPreviewCounts = {
  total: number;
  withLogs: number;
  rated: number;
  reviewed: number;
  backlog: number;
};

export type ImportPreviewResponse = {
  mediaType: MediaTypeEnum;
  entries: ImportEntry[];
  counts: ImportPreviewCounts;
};

export type ImportMatchRequestItem = {
  key: string;
  title: string;
  year?: number | null;
  mediaType: MediaTypeEnum;
  externalRefs: Record<string, string>;
};

export type ImportCandidate = {
  provider: string;
  externalId: string;
  mediaType: MediaTypeEnum;
  title: string;
  year?: number | null;
  coverUrl?: string | null;
  overview?: string | null;
  releaseDate?: string | null;
  score: number;
};

export type ImportMatchStatus =
  | "matched"
  | "ambiguous"
  | "not_found"
  | "already_in_library";

export type ImportMatchResult = {
  key: string;
  status: ImportMatchStatus;
  match?: ImportCandidate | null;
  candidates: ImportCandidate[];
  existingMediaId?: number | null;
};

export type ImportCommitEntry = {
  key: string;
  mediaType: MediaTypeEnum;
  externalId: string;
  title: string;
  year?: number | null;
  coverUrl?: string | null;
  overview?: string | null;
  releaseDate?: string | null;
  status?: MediaStatusEnum | null;
  rating?: number | null;
  review?: string | null;
  logs: ImportLogEntry[];
  addToBacklog: boolean;
  backlogDate?: string | null;
};

export type ImportCommitItem = {
  key: string;
  externalId: string;
  mediaType: MediaTypeEnum;
  title: string;
  outcome: "imported" | "merged" | "skipped" | "failed";
  logsCreated: number;
  backlogAdded: boolean;
  reason?: string | null;
};

export type ImportCommitResponse = {
  imported: number;
  merged: number;
  skipped: number;
  logsCreated: number;
  backlogAdded: number;
  failures: { name: string; reason: string }[];
  items: ImportCommitItem[];
};
