import { useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import {
  ArrowUp,
  Check,
  ExternalLink,
  ImageOff,
  Loader2,
  Plus,
  Search,
  SkipForward,
  Trash2,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

import { TypeMark } from "@/components/tw/generic/badges";
import { Card } from "@/components/tw/generic/card";
import { ConfirmDialog } from "@/components/tw/generic/confirmDialog";
import { ImportCompareDialog } from "@/components/tw/import/ImportCompareDialog";
import { ImportDropzone } from "@/components/tw/import/ImportDropzone";
import { ImportExternalLink } from "@/components/tw/import/ImportExternalLink";
import { ImportFilters, type ImportFilterKey, type ImportFilterValue } from "@/components/tw/import/ImportFilters";
import { ImportProviderCard } from "@/components/tw/import/ImportProviderCard";
import { ImportMatchMark, ImportOutcomeMark } from "@/components/tw/import/ImportStatusMark";
import { Button } from "@/components/ui/button";
import { BaseInput } from "@/components/ui/input";
import {
  SelectBase,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  isActiveJobStatus,
  useImportJob,
  useImportJobItems,
  useImportJobs,
} from "@/hooks/useImportJobs";
import { cn } from "@/lib/utils";
import {
  cancelImportJob,
  commitImportJob,
  createImportJob,
  deleteImportJob,
  listImportProviders,
  patchImportJobItem,
  searchImportCandidates,
} from "@/querries/import";
import { suwayomiApi } from "@/querries/suwayomi";
import { useAppSelector } from "@/store/auth/hooks";
import type {
  ImportCandidate,
  ImportCommitItem,
  ImportCommitResponse,
  ImportEntry,
  ImportMatchResult,
  ImportProviderInfo,
} from "@/types/import";
import type {
  ImportJob,
  ImportJobItem,
  ImportJobItemsResponse,
  ImportJobStatus,
} from "@/types/importJob";
import type { MediaTypeEnum } from "@/types/media";
import { metadataProviderKey, metadataUrl, sourceUrl } from "@/utils/importLinks";

// Itens são paginados no servidor; renderizar milhares de linhas trava a UI.
const PAGE_SIZE = 50;
const EMPTY_CANDIDATES: ImportCandidate[] = [];

type ImportStep = 1 | 2 | 3;
type ConfirmAction = { type: "cancel" | "delete"; job: ImportJob };

function StepRail({
  step,
  canReview,
  canResult,
  onSelect,
}: {
  step: ImportStep;
  canReview: boolean;
  canResult: boolean;
  onSelect: (step: ImportStep) => void;
}) {
  const { t } = useTranslation("import");

  const steps: { id: ImportStep; label: string }[] = [
    { id: 1, label: t("steps.source") },
    { id: 2, label: t("steps.review") },
    { id: 3, label: t("steps.result") },
  ];

  const reachable = (id: ImportStep) =>
    id === 1 || (id === 2 && canReview) || (id === 3 && canResult);

  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {steps.map((item, index) => {
        const state = item.id < step ? "done" : item.id === step ? "current" : "upcoming";
        const enabled = reachable(item.id);

        return (
          <Fragment key={item.id}>
            <li className="flex min-w-0 items-center">
              <button
                type="button"
                disabled={!enabled}
                onClick={() => onSelect(item.id)}
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "flex min-w-0 items-center gap-2 rounded-control text-left",
                  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  enabled ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border text-step-0 tabular-nums transition-colors",
                    state === "current" && "border-primary bg-primary text-primary-foreground",
                    state === "done" && "border-primary bg-primary/10 text-primary",
                    state === "upcoming" && "border-border text-muted-foreground"
                  )}
                >
                  {state === "done" ? <Check className="size-3" /> : item.id}
                </span>
                <span
                  className={cn(
                    "truncate text-step-1",
                    state === "upcoming" ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
            {index < steps.length - 1 && (
              <li aria-hidden="true" className="h-px flex-1 bg-border" />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}

function StepHeading({
  title,
  collapsed = false,
  onEdit,
  editLabel,
}: {
  title: string;
  collapsed?: boolean;
  onEdit?: () => void;
  editLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
      <h2 className="min-w-0 truncate font-serif text-step-3 font-medium">{title}</h2>
      {collapsed && onEdit && (
        <Button type="button" variant="ghost" size="sm" onClick={onEdit} className="shrink-0">
          {editLabel}
        </Button>
      )}
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-control border border-border px-3 py-2">
      <p className="font-serif text-step-3 tabular-nums">{value}</p>
      <p className="text-step-0 text-muted-foreground">{label}</p>
    </div>
  );
}

interface EntryRowProps {
  entry: ImportEntry;
  match?: ImportMatchResult;
  result?: ImportCommitItem;
  selected: ImportCandidate | null;
  ignored: boolean;
  willBacklog: boolean;
  pending: boolean;
  candidates: ImportCandidate[];
  onSelect: (key: string, candidate: ImportCandidate) => void;
  onToggleIgnored: (key: string) => void;
  onSearch: (entry: ImportEntry, query: string) => Promise<ImportCandidate[]>;
  onOpenDetails: (key: string) => void;
}

const EntryRow = memo(function EntryRow({
  entry,
  match,
  result,
  selected,
  ignored,
  willBacklog,
  pending,
  candidates,
  onSelect,
  onToggleIgnored,
  onSearch,
  onOpenDetails,
}: EntryRowProps) {
  const { t } = useTranslation("import");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const status = match?.status ?? "not_found";
  const hasLog = entry.logs.length > 0;
  const poster = selected?.coverUrl ?? match?.match?.coverUrl ?? null;
  const sourceHref = sourceUrl(entry);
  const sourceLabel = t(`providers.${entry.source}.label`, { defaultValue: entry.source });
  const selectedHref = selected ? metadataUrl(selected) : null;
  const needsCompare =
    !pending && (status === "ambiguous" || status === "not_found" || result?.outcome === "failed");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await onSearch(entry, query.trim());
      if (results.length === 0) toast.message(t("match.noResults"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.match"));
    } finally {
      setSearching(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b border-border py-3 transition-colors last:border-b-0",
        "hover:bg-accent/40",
        ignored && "opacity-60"
      )}
    >
      {pending ? (
        <Skeleton className="h-24 w-16 shrink-0 rounded-control" />
      ) : (
        <button
          type="button"
          onClick={() => onOpenDetails(entry.key)}
          aria-label={t("dialog.open", { title: entry.title })}
          className={cn(
            "h-24 w-16 shrink-0 overflow-hidden rounded-control bg-muted transition-opacity hover:opacity-90",
            "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          )}
        >
          {poster ? (
            <img src={poster} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-4" aria-hidden="true" />
            </span>
          )}
        </button>
      )}

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="truncate text-step-2 font-medium">{entry.title}</span>
          {entry.year && (
            <span className="text-step-0 tabular-nums text-muted-foreground">{entry.year}</span>
          )}
          <TypeMark type={entry.mediaType} />
          {pending ? (
            <span className="inline-flex items-center gap-1.5" role="status" aria-live="polite">
              <Skeleton className="h-3 w-16" />
              <span className="sr-only">{t("match.matching")}</span>
            </span>
          ) : (
            <ImportMatchMark status={status} />
          )}
          {result && <ImportOutcomeMark outcome={result.outcome} />}
          {ignored && (
            <span className="text-step-0 text-muted-foreground">{t("match.ignored")}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-step-0 text-muted-foreground">
          {hasLog && (
            <span className="tabular-nums">
              {t("filters.log")}: {entry.logs.length}
            </span>
          )}
          {willBacklog && <span>{t("filters.backlog")}</span>}
          <span>
            {t("meta", {
              rating: entry.rating ?? "—",
              review: entry.review ? t("reviewYes") : t("reviewNo"),
            })}
          </span>
          {result?.outcome === "failed" && result.reason && (
            <span className="text-destructive">{t("result.reason", { reason: result.reason })}</span>
          )}
          {match?.error && (
            <span className="text-destructive">{match.error}</span>
          )}
        </div>

        {needsCompare && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-step-0">
            <span className="text-muted-foreground">{t("compare.label")}</span>
            {sourceHref ? (
              <ImportExternalLink href={sourceHref}>
                {t("compare.source", { name: sourceLabel })}
              </ImportExternalLink>
            ) : null}
            {selectedHref && selected ? (
              <ImportExternalLink href={selectedHref}>
                {t(metadataProviderKey(selected.provider), { defaultValue: selected.provider })}
              </ImportExternalLink>
            ) : null}
            <button
              type="button"
              onClick={() => onOpenDetails(entry.key)}
              className={cn(
                "rounded-control text-primary underline-offset-4 transition-colors hover:underline",
                "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              )}
            >
              {t("compare.details")}
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {candidates.length > 0 && (
            <SelectBase
              value={selected ? selected.externalId : ""}
              onValueChange={(value) => {
                const candidate = candidates.find((item) => item.externalId === value);
                if (candidate) onSelect(entry.key, candidate);
              }}
            >
              <SelectTrigger size="sm" className="max-w-72">
                <SelectValue placeholder={t("match.choose")} />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((candidate) => (
                  <SelectItem key={candidate.externalId} value={candidate.externalId}>
                    {candidate.title} ({candidate.year ?? "—"})
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectBase>
          )}

          <div className="flex min-w-52 flex-1 items-center gap-1">
            <BaseInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleSearch();
              }}
              placeholder={t("match.searchPlaceholder")}
              className="h-8"
            />
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={handleSearch}
              disabled={searching}
              aria-label={t("match.search")}
            >
              {searching ? <Loader2 className="animate-spin" /> : <Search />}
            </Button>
          </div>
        </div>
      </div>

      <Button
        type="button"
        size="xs"
        variant="ghost"
        onClick={() => onToggleIgnored(entry.key)}
        className="shrink-0 text-muted-foreground"
        aria-label={ignored ? t("match.restore") : t("match.ignore")}
      >
        {ignored ? <Undo2 /> : <SkipForward />}
        <span className="hidden sm:inline">{ignored ? t("match.restore") : t("match.ignore")}</span>
      </Button>
    </div>
  );
});

function toEntry(item: ImportJobItem): ImportEntry {
  return {
    key: item.key,
    mediaType: item.mediaType,
    title: item.title,
    year: item.year,
    overview: item.overview,
    source: item.source,
    externalRefs: item.externalRefs,
    status: item.status,
    rating: item.rating,
    review: item.review,
    logs: item.logs,
    inBacklog: item.inBacklog,
    backlogDate: item.backlogDate,
  };
}

function toMatch(item: ImportJobItem): ImportMatchResult {
  return {
    key: item.key,
    status:
      item.matchStatus === "error"
        ? "not_found"
        : item.matchStatus ?? "not_found",
    match: item.match ?? null,
    candidates: item.candidates,
    existingMediaId: item.existingMediaId,
    error: item.matchError,
  };
}

function mergeCandidates(
  item: ImportJobItem,
  extra?: ImportCandidate[]
): ImportCandidate[] {
  const seen = new Set<string>();
  const result: ImportCandidate[] = [];
  for (const candidate of [...item.candidates, ...(extra ?? [])]) {
    if (seen.has(candidate.externalId)) continue;
    seen.add(candidate.externalId);
    result.push(candidate);
  }
  return result;
}

function formatJobDate(value?: string | null): string {
  if (!value) return "";
  const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

const JOB_STATUS_STYLES: Record<ImportJobStatus, string> = {
  queued: "bg-muted text-muted-foreground",
  parsing: "bg-muted text-muted-foreground",
  matching: "bg-primary/10 text-primary",
  ready: "bg-primary text-primary-foreground",
  done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

function JobStatusBadge({ status }: { status: ImportJobStatus }) {
  const { t } = useTranslation("import");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-step-0",
        JOB_STATUS_STYLES[status]
      )}
    >
      {t(`jobs.status.${status}`)}
    </span>
  );
}

function RecentJobs({
  jobs,
  currentJobId,
  onOpen,
  onCancel,
  onDelete,
}: {
  jobs: ImportJob[];
  currentJobId: number | null;
  onOpen: (job: ImportJob) => void;
  onCancel: (job: ImportJob) => void;
  onDelete: (job: ImportJob) => void;
}) {
  const { t } = useTranslation("import");

  if (jobs.length === 0) return null;

  return (
    <div className="space-y-2 border-t border-border pt-4">
      <p className="text-step-1 font-medium">{t("jobs.recent")}</p>
      <div className="rounded-control border border-border">
        {jobs.map((job) => {
          const active = isActiveJobStatus(job.status);
          const cancellable = active || job.status === "ready";
          const deletable =
            job.status === "done" ||
            job.status === "failed" ||
            job.status === "cancelled";
          const label = t(`providers.${job.provider}.label`, {
            defaultValue: job.provider,
          });

          return (
            <div
              key={job.id}
              className={cn(
                "flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 last:border-b-0",
                job.id === currentJobId && "bg-accent/40"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-step-1 font-medium">{label}</p>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-step-0 text-muted-foreground">
                  <JobStatusBadge status={job.status} />
                  {job.progressTotal > 0 ? (
                    <span className="tabular-nums">
                      {t("jobs.progress", {
                        done: job.progressDone,
                        total: job.progressTotal,
                      })}
                    </span>
                  ) : (
                    <span>{formatJobDate(job.createdAt)}</span>
                  )}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  size="xs"
                  variant={job.status === "ready" ? "default" : "outline"}
                  onClick={() => onOpen(job)}
                >
                  <ExternalLink />
                  {job.status === "done"
                    ? t("jobs.openResult")
                    : job.status === "ready"
                      ? t("jobs.review")
                      : t("jobs.open")}
                </Button>
                {cancellable && (
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => onCancel(job)}
                    aria-label={t("jobs.cancel")}
                  >
                    <X />
                  </Button>
                )}
                {deletable && (
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => onDelete(job)}
                    aria-label={t("jobs.delete")}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ImportManager() {
  const { t } = useTranslation("import");
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const jobId = Number(searchParams.get("job")) || null;
  const providerParam = searchParams.get("provider");
  const usernameParam = searchParams.get("username");

  const { data: providers } = useQuery({
    queryKey: ["import", "providers"],
    queryFn: listImportProviders,
    staleTime: Infinity,
  });
  const { data: jobs } = useImportJobs(user?.id);
  const jobQuery = useImportJob(jobId, user?.id);
  const job = jobQuery.data;

  const [step, setStep] = useState<ImportStep>(jobId ? 2 : 1);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaTypeEnum | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [filter, setFilter] = useState<ImportFilterValue>("all");
  const [addBacklog, setAddBacklog] = useState(true);
  const [creating, setCreating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [summary, setSummary] = useState<ImportCommitResponse | null>(null);
  const [extraCandidates, setExtraCandidates] = useState<Record<string, ImportCandidate[]>>({});
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const listTopRef = useRef<HTMLDivElement>(null);
  const lastJobId = useRef<number | null>(null);

  const itemsQuery = useImportJobItems(
    jobId,
    user?.id,
    filter,
    job?.status === "ready",
    PAGE_SIZE
  );

  const provider = providers?.find((item) => item.id === providerId);
  const providerNotes = provider
    ? (t(`providers.${provider.id}.notes`, {
      returnObjects: true,
      defaultValue: [],
    }) as unknown as string[])
    : [];
  const providerLabel = (item: ImportProviderInfo) =>
    t(`providers.${item.id}.label`, { defaultValue: item.label });
  const providerLabelById = (id: string) =>
    t(`providers.${id}.label`, { defaultValue: id });

  const { data: suwayomiConfig } = useQuery({
    queryKey: ["suwayomi", "config", user?.id],
    queryFn: () => suwayomiApi.getConfig(user!.id),
    enabled: !!user && providerId === "suwayomi",
  });

  useEffect(() => {
    if (providerId === "suwayomi" && suwayomiConfig?.baseUrl) {
      setServerUrl((current) => current || suwayomiConfig.baseUrl || "");
    }
  }, [providerId, suwayomiConfig]);

  useEffect(() => {
    if (job?.status === "done" && job.summary && step === 2) {
      setSummary(job.summary);
      setStep(3);
    }
  }, [job?.status, job?.summary, step]);

  useEffect(() => {
    if (!job) return;
    if (lastJobId.current === job.id) return;
    lastJobId.current = job.id;
    setFilter("all");
    setExtraCandidates({});
    setDetailKey(null);
    setSummary(job.status === "done" ? job.summary ?? null : null);
    setStep(job.status === "done" && job.summary ? 3 : 2);
  }, [job]);

  useEffect(() => {
    if (!providerParam || providerId || !providers) return;
    const match = providers.find((item) => item.id === providerParam);
    if (match) {
      handleSelectProvider(match);
      if (usernameParam) setUsername(usernameParam);
    }
  }, [providerParam, providerId, providers, usernameParam]);

  const items = useMemo(
    () => itemsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [itemsQuery.data]
  );
  const lastPage = itemsQuery.data?.pages[itemsQuery.data.pages.length - 1];
  const itemsTotal = lastPage?.total ?? items.length;
  const itemCounts = lastPage?.counts ?? {};
  const jobCounts = job?.counts ?? {};
  const selectedCount = jobCounts.selected ?? 0;
  const percent =
    job && job.progressTotal > 0
      ? Math.round((job.progressDone / job.progressTotal) * 100)
      : 0;
  const active = isActiveJobStatus(job?.status);

  const filterCounts: Record<ImportFilterKey, number> = {
    log: itemCounts.log ?? jobCounts.withLogs ?? 0,
    backlog: itemCounts.backlog ?? jobCounts.backlog ?? 0,
    validated:
      itemCounts.validated ??
      (jobCounts.matched ?? 0) + (jobCounts.alreadyInLibrary ?? 0),
    attention: itemCounts.attention ?? jobCounts.ambiguous ?? 0,
    errors:
      itemCounts.errors ??
      (jobCounts.notFound ?? 0) + (jobCounts.errors ?? 0),
  };

  const resultByKey = useMemo(() => {
    const source = summary ?? job?.summary ?? null;
    return new Map((source?.items ?? []).map((item) => [item.key, item]));
  }, [summary, job?.summary]);

  const detailItem = detailKey
    ? items.find((item) => item.key === detailKey)
    : undefined;
  const detailEntry = detailItem ? toEntry(detailItem) : undefined;
  const detailMatch = detailItem ? toMatch(detailItem) : undefined;
  const detailCandidates = detailItem
    ? mergeCandidates(detailItem, extraCandidates[detailItem.key])
    : EMPTY_CANDIDATES;

  const openJob = (id: number | null) => {
    const next = new URLSearchParams(searchParams);
    if (id === null) next.delete("job");
    else next.set("job", String(id));
    setSearchParams(next, { replace: true });
  };

  const handleSelectProvider = (item: ImportProviderInfo) => {
    setProviderId(item.id);
    setMediaType(
      item.inputType === "connection" ? null : item.mediaTypes[0] ?? null
    );
    setFile(null);
    setUsername("");
    setServerUrl("");
    setSummary(null);
    setStep(1);
    lastJobId.current = null;
    openJob(null);
    setFilter("all");
    setExtraCandidates({});
    setDetailKey(null);
  };

  const handleAnalyze = async () => {
    if (!user || !provider) return;
    if (provider.inputType === "file" && !file) {
      toast.error(t("errors.noFile"));
      return;
    }
    if (provider.inputType === "username" && !username.trim()) {
      toast.error(t("errors.noUsername"));
      return;
    }
    if (provider.inputType === "url" && !serverUrl.trim()) {
      toast.error(t("errors.noUrl"));
      return;
    }

    setCreating(true);
    try {
      const created = await createImportJob({
        userId: user.id,
        providerId: provider.id,
        file: file ?? undefined,
        username: username.trim() || undefined,
        sourceUrl: serverUrl.trim() || undefined,
        mediaType: mediaType ?? undefined,
      });
      lastJobId.current = null;
      openJob(created.id);
      setStep(2);
      setSummary(null);
      await queryClient.invalidateQueries({ queryKey: ["import-jobs"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.parse"));
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = useCallback(
    async (entry: ImportEntry, query: string) => {
      if (!user) return [];
      const results = await searchImportCandidates(query, entry.mediaType, user.id);
      setExtraCandidates((prev) => ({ ...prev, [entry.key]: results }));
      return results;
    },
    [user]
  );

  const updateCachedItem = useCallback(
    (key: string, patch: Partial<ImportJobItem>) => {
      queryClient.setQueriesData<InfiniteData<ImportJobItemsResponse>>(
        { queryKey: ["import-job-items", jobId, user?.id] },
        (old) =>
          old
            ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                items: page.items.map((item) =>
                  item.key === key ? { ...item, ...patch } : item
                ),
              })),
            }
            : old
      );
    },
    [jobId, queryClient, user?.id]
  );

  const handleSelectCandidate = useCallback(
    async (key: string, candidate: ImportCandidate) => {
      if (!user || !jobId) return;
      const item = items.find((entry) => entry.key === key);
      if (!item) return;

      updateCachedItem(key, { selected: candidate, ignored: false });
      try {
        await patchImportJobItem(jobId, item.id, user.id, {
          selected: candidate,
          ignored: false,
        });
        queryClient.invalidateQueries({ queryKey: ["import-job", jobId, user.id] });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("errors.commit"));
        queryClient.invalidateQueries({
          queryKey: ["import-job-items", jobId, user.id],
        });
      }
    },
    [items, jobId, queryClient, t, updateCachedItem, user]
  );

  const handleToggleIgnored = useCallback(
    async (key: string) => {
      if (!user || !jobId) return;
      const item = items.find((entry) => entry.key === key);
      if (!item) return;

      const next = !item.ignored;
      updateCachedItem(key, { ignored: next });
      try {
        await patchImportJobItem(jobId, item.id, user.id, { ignored: next });
        queryClient.invalidateQueries({ queryKey: ["import-job", jobId, user.id] });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("errors.commit"));
        queryClient.invalidateQueries({
          queryKey: ["import-job-items", jobId, user.id],
        });
      }
    },
    [items, jobId, queryClient, t, updateCachedItem, user]
  );

  const handleOpenDetails = useCallback((key: string) => {
    setDetailKey(key);
  }, []);

  const handleCommit = async () => {
    if (!user || !jobId) return;
    setCommitting(true);
    try {
      const result = await commitImportJob(jobId, user.id, addBacklog);
      setSummary(result);
      setStep(3);
      toast.success(
        t("commit.success", { count: result.imported + result.merged })
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["import-job", jobId, user.id] }),
        queryClient.invalidateQueries({ queryKey: ["import-jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["media"] }),
        queryClient.invalidateQueries({ queryKey: ["existingMedia"] }),
        queryClient.invalidateQueries({ queryKey: ["media-logs"] }),
        queryClient.invalidateQueries({ queryKey: ["backlog"] }),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.commit"));
    } finally {
      setCommitting(false);
    }
  };

  const handleOpenJob = (selectedJob: ImportJob) => {
    lastJobId.current = null;
    openJob(selectedJob.id);
    setSummary(selectedJob.status === "done" ? selectedJob.summary ?? null : null);
    setStep(selectedJob.status === "done" && selectedJob.summary ? 3 : 2);
  };

  const handleNewImport = () => {
    if (job && !providerId) setProviderId(job.provider);
    lastJobId.current = null;
    openJob(null);
    setSummary(null);
    setStep(1);
    setFilter("all");
    setExtraCandidates({});
    setDetailKey(null);
  };

  const handleConfirmAction = async () => {
    if (!user || !confirmAction) return;
    setActionPending(true);
    try {
      if (confirmAction.type === "cancel") {
        await cancelImportJob(confirmAction.job.id, user.id);
        toast.success(t("jobs.cancelSuccess"));
      } else {
        await deleteImportJob(confirmAction.job.id, user.id);
        toast.success(t("jobs.deleteSuccess"));
        if (confirmAction.job.id === jobId) handleNewImport();
      }
      await queryClient.invalidateQueries({ queryKey: ["import-jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["import-job"] });
      setConfirmAction(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.commit"));
    } finally {
      setActionPending(false);
    }
  };

  const scrollToTop = () =>
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="w-full space-y-5">
      <Card>
        <StepRail
          step={step}
          canReview={!!job && job.status !== "done"}
          canResult={summary !== null}
          onSelect={setStep}
        />
      </Card>

      <Card>
        <StepHeading
          title={t(step === 1 ? "steps.source" : step === 2 ? "steps.review" : "steps.result")}
        />

        {step === 1 && (
          <>
            <p className="text-step-1 text-muted-foreground">{t("input.chooseProvider")}</p>

            {providers ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {providers.map((item) => (
                  <ImportProviderCard
                    key={item.id}
                    provider={item}
                    label={providerLabel(item)}
                    selected={item.id === providerId}
                    onSelect={() => handleSelectProvider(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((index) => (
                  <Skeleton key={index} className="h-20" />
                ))}
              </div>
            )}

            {provider && (
              <div className="space-y-3 rounded-control bg-muted/40 p-3">
                <p className="text-step-1 text-muted-foreground">
                  {t(`providers.${provider.id}.description`, { defaultValue: "" })}
                </p>
                <a
                  href={t(`providers.${provider.id}.helpUrl`, { defaultValue: "" })}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "inline-block text-step-1 text-primary underline-offset-4 hover:underline",
                    !t(`providers.${provider.id}.helpLabel`, { defaultValue: "" }) && "hidden"
                  )}
                >
                  {t(`providers.${provider.id}.helpLabel`, { defaultValue: "" })}
                </a>

                {Array.isArray(providerNotes) && providerNotes.length > 0 && (
                  <div className="rounded-control border border-border p-3">
                    <p className="text-step-0 font-medium">{t("input.notesTitle")}</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-step-0 text-muted-foreground">
                      {providerNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(provider.inputType === "username" ||
                  provider.inputType === "connection") &&
                  provider.mediaTypes.length > 1 && (
                  <SelectBase
                    value={mediaType ?? "all"}
                    onValueChange={(value) =>
                      setMediaType(
                        value === "all" ? null : (value as MediaTypeEnum)
                      )
                    }
                  >
                    <SelectTrigger size="sm" className="max-w-52">
                      <SelectValue placeholder={t("input.mediaTypeLabel")} />
                    </SelectTrigger>
                    <SelectContent>
                      {provider.inputType === "connection" && (
                        <SelectItem value="all">
                          {t("input.allMediaTypes")}
                        </SelectItem>
                      )}
                      {provider.mediaTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`type.${type}`, { ns: "media" })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectBase>
                )}

                {provider.inputType === "connection" ? (
                  <div className="space-y-1.5 rounded-control border border-border p-3">
                    <p className="text-step-1">{t("input.connectionHint")}</p>
                    <Link
                      to="/settings"
                      className="inline-block text-step-1 text-primary underline-offset-4 hover:underline"
                    >
                      {t("input.configureConnection")}
                    </Link>
                  </div>
                ) : provider.inputType === "file" ? (
                  <div className="space-y-1.5">
                    <label className="text-step-1" htmlFor="import-file">
                      {t("input.fileLabel")}
                    </label>
                    <ImportDropzone
                      id="import-file"
                      accept={provider.accepts ?? undefined}
                      file={file}
                      onFileChange={setFile}
                    />
                  </div>
                ) : provider.inputType === "url" ? (
                  <div className="space-y-1.5">
                    <label className="text-step-1" htmlFor="import-url">
                      {t("input.urlLabel")}
                    </label>
                    <BaseInput
                      id="import-url"
                      name="import-url"
                      value={serverUrl}
                      placeholder={t(`providers.${provider.id}.urlPlaceholder`, {
                        defaultValue: "",
                      })}
                      onChange={(event) => setServerUrl(event.target.value)}
                    />
                    <p className="text-step-0 text-muted-foreground">
                      {t(`providers.${provider.id}.urlHint`, { defaultValue: "" })}
                    </p>
                    {provider.id === "suwayomi" && !suwayomiConfig?.configured && (
                      <p className="text-step-0 text-muted-foreground">
                        {t("providers.suwayomi.configureFirst")}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-step-1" htmlFor="import-username">
                      {t("input.usernameLabel")}
                    </label>
                    <BaseInput
                      id="import-username"
                      name="import-username"
                      value={username}
                      placeholder={t(`providers.${provider.id}.usernamePlaceholder`, {
                        defaultValue: "",
                      })}
                      onChange={(event) => setUsername(event.target.value)}
                    />
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={creating}
                  className="w-full sm:w-auto"
                >
                  {creating ? <Loader2 className="animate-spin" /> : <Upload />}
                  {creating ? t("input.analyzing") : t("input.analyze")}
                </Button>
              </div>
            )}

            <RecentJobs
              jobs={jobs ?? []}
              currentJobId={jobId}
              onOpen={handleOpenJob}
              onCancel={(selectedJob) =>
                setConfirmAction({ type: "cancel", job: selectedJob })
              }
              onDelete={(selectedJob) =>
                setConfirmAction({ type: "delete", job: selectedJob })
              }
            />
          </>
        )}

        {step === 2 && (
          <>
            {jobQuery.isLoading && <Skeleton className="h-24 w-full" />}

            {jobQuery.error && (
              <div className="space-y-2 rounded-control border border-destructive/40 p-3">
                <p className="text-step-1 text-destructive">
                  {jobQuery.error instanceof Error
                    ? jobQuery.error.message
                    : t("errors.parse")}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleNewImport}
                >
                  <Plus /> {t("jobs.retry")}
                </Button>
              </div>
            )}

            {job && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border px-3 py-2">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 truncate text-step-1 font-medium">
                      {providerLabelById(job.provider)}
                      <JobStatusBadge status={job.status} />
                    </p>
                    <p className="text-step-0 text-muted-foreground">
                      {job.progressTotal > 0
                        ? t("jobs.progress", {
                          done: job.progressDone,
                          total: job.progressTotal,
                        })
                        : formatJobDate(job.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleNewImport}
                    >
                      <Plus /> {t("jobs.retry")}
                    </Button>
                    {(active || job.status === "ready") && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setConfirmAction({ type: "cancel", job })
                        }
                      >
                        <X /> {t("jobs.cancel")}
                      </Button>
                    )}
                  </div>
                </div>

                {active && (
                  <div className="space-y-2" role="status" aria-live="polite">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-step-1 text-muted-foreground">
                        {t(`jobs.status.${job.status}`)}
                      </p>
                      <span className="font-serif text-step-2 tabular-nums">
                        {percent}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-step-0 text-muted-foreground">
                      {t("jobs.leaveHint")}
                    </p>
                  </div>
                )}

                {(job.status === "failed" || job.status === "cancelled") && (
                  <div
                    className={cn(
                      "space-y-2 rounded-control border p-3",
                      job.status === "failed"
                        ? "border-destructive/40"
                        : "border-border"
                    )}
                  >
                    <p
                      className={cn(
                        "font-medium text-step-1",
                        job.status === "failed" && "text-destructive"
                      )}
                    >
                      {job.status === "failed"
                        ? t("jobs.failedTitle")
                        : t("jobs.status.cancelled")}
                    </p>
                    {job.error && (
                      <p className="text-step-0 text-muted-foreground">
                        {job.error}
                      </p>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleNewImport}
                    >
                      <Plus /> {t("jobs.retry")}
                    </Button>
                  </div>
                )}

                {job.status === "ready" && (
                  <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      <StatCell label={t("counts.total")} value={jobCounts.total ?? 0} />
                      <StatCell
                        label={t("counts.withLogs")}
                        value={jobCounts.withLogs ?? 0}
                      />
                      <StatCell label={t("counts.rated")} value={jobCounts.rated ?? 0} />
                      <StatCell
                        label={t("counts.reviewed")}
                        value={jobCounts.reviewed ?? 0}
                      />
                      <StatCell
                        label={t("counts.backlog")}
                        value={jobCounts.backlog ?? 0}
                      />
                    </div>

                    <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
                      <ImportFilters
                        value={filter}
                        counts={filterCounts}
                        onChange={setFilter}
                      />
                      <label className="flex items-center gap-2 pb-1.5">
                        <Switch
                          checked={addBacklog}
                          onCheckedChange={setAddBacklog}
                          aria-label={t("options.backlog")}
                        />
                        <span className="text-step-1">{t("options.backlog")}</span>
                      </label>
                    </div>

                    <p className="text-step-0 text-muted-foreground">
                      {t("filters.showing", {
                        shown: items.length,
                        total: itemsTotal,
                      })}
                    </p>

                    {itemsQuery.isLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : items.length > 0 ? (
                      <div className="space-y-2">
                        <div
                          ref={listTopRef}
                          className="scroll-mt-16 rounded-control border border-border px-3"
                        >
                          {items.map((item) => (
                            <EntryRow
                              key={item.key}
                              entry={toEntry(item)}
                              match={toMatch(item)}
                              result={resultByKey.get(item.key)}
                              selected={item.selected ?? null}
                              ignored={item.ignored}
                              willBacklog={addBacklog && item.inBacklog}
                              pending={false}
                              candidates={mergeCandidates(
                                item,
                                extraCandidates[item.key]
                              )}
                              onSelect={handleSelectCandidate}
                              onToggleIgnored={handleToggleIgnored}
                              onSearch={handleSearch}
                              onOpenDetails={handleOpenDetails}
                            />
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {itemsQuery.hasNextPage ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => void itemsQuery.fetchNextPage()}
                              disabled={itemsQuery.isFetchingNextPage}
                            >
                              {itemsQuery.isFetchingNextPage ? (
                                <Loader2 className="animate-spin" />
                              ) : null}
                              {t("jobs.loadMore")}
                            </Button>
                          ) : (
                            <span />
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={scrollToTop}
                          >
                            <ArrowUp aria-hidden="true" />
                            {t("filters.backToTop")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-control border border-border p-3 text-step-1 text-muted-foreground">
                        {t("filters.empty")}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                      <span className="text-step-1 text-muted-foreground">
                        {t("commit.selected", { count: selectedCount })}
                      </span>
                      <Button
                        type="button"
                        onClick={handleCommit}
                        disabled={committing || selectedCount === 0}
                      >
                        {committing ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Upload />
                        )}
                        {committing
                          ? t("commit.working")
                          : t("commit.action", { count: selectedCount })}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {step === 3 && summary && (
          <>
            <p className="font-serif text-step-4 font-medium">{t("summary.title")}</p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCell label={t("summary.imported")} value={summary.imported} />
              <StatCell label={t("summary.merged")} value={summary.merged} />
              <StatCell label={t("summary.logs")} value={summary.logsCreated} />
              <StatCell label={t("summary.backlog")} value={summary.backlogAdded} />
            </div>

            {summary.skipped > 0 && (
              <p className="text-step-1 text-muted-foreground">
                {t("summary.skippedCount", { count: summary.skipped })}
              </p>
            )}

            {summary.failures.length > 0 && (
              <details className="rounded-control border border-border p-3">
                <summary className="cursor-pointer text-step-1 text-destructive">
                  {t("summary.failures", { count: summary.failures.length })}
                </summary>
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-step-1 text-muted-foreground">
                  {summary.failures.map((failure) => (
                    <li key={failure.name}>
                      {t("summary.failureItem", {
                        name: failure.name,
                        reason: failure.reason,
                      })}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handleNewImport}>
                {t("summary.restart")}
              </Button>
            </div>
          </>
        )}
      </Card>

      {detailEntry && (
        <ImportCompareDialog
          open={detailKey !== null}
          onOpenChange={(next) => {
            if (!next) setDetailKey(null);
          }}
          entry={detailEntry}
          match={detailMatch}
          selected={detailItem?.selected ?? null}
          candidates={detailCandidates}
          sourceHref={sourceUrl(detailEntry)}
          sourceLabel={t(`providers.${detailEntry.source}.label`, {
            defaultValue: detailEntry.source,
          })}
          onSelect={(candidate) => {
            if (detailItem) void handleSelectCandidate(detailItem.key, candidate);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmAction(null);
        }}
        title={
          confirmAction?.type === "delete"
            ? t("jobs.deleteTitle")
            : t("jobs.cancelTitle")
        }
        description={
          confirmAction?.type === "delete"
            ? t("jobs.deleteDescription")
            : t("jobs.cancelDescription")
        }
        confirmLabel={
          confirmAction?.type === "delete"
            ? t("jobs.deleteConfirm")
            : t("jobs.cancelConfirm")
        }
        onConfirm={() => void handleConfirmAction()}
        isPending={actionPending}
      />
    </div>
  );
}

export default ImportManager;
