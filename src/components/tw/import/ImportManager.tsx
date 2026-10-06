import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Check, ImageOff, Loader2, Search, SkipForward, Undo2, Upload } from "lucide-react";
import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { TypeMark } from "@/components/tw/generic/badges";
import { Card } from "@/components/tw/generic/card";
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
import { cn } from "@/lib/utils";
import {
  commitImport,
  listImportProviders,
  matchImport,
  parseImport,
  searchImportCandidates,
} from "@/querries/import";
import { useAppSelector } from "@/store/auth/hooks";
import type {
  ImportCandidate,
  ImportCommitItem,
  ImportCommitResponse,
  ImportEntry,
  ImportMatchResult,
  ImportPreviewCounts,
  ImportProviderInfo,
} from "@/types/import";
import type { MediaTypeEnum } from "@/types/media";
import { metadataProviderKey, metadataUrl, sourceUrl } from "@/utils/importLinks";

// A metadata é buscada em lotes para caber no timeout e mostrar progresso.
const MATCH_CHUNK = 50;
// A lista é paginada: renderizar milhares de linhas com Select/Dialog trava a UI.
const PAGE_SIZE = 50;
const EMPTY_CANDIDATES: ImportCandidate[] = [];

type ImportStep = 1 | 2 | 3;

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

function ImportManager() {
  const { t } = useTranslation("import");
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const { data: providers } = useQuery({
    queryKey: ["import", "providers"],
    queryFn: listImportProviders,
    staleTime: Infinity,
  });

  const [step, setStep] = useState<ImportStep>(1);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaTypeEnum | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState("");

  const [entries, setEntries] = useState<ImportEntry[]>([]);
  const [counts, setCounts] = useState<ImportPreviewCounts | null>(null);
  const [matches, setMatches] = useState<Record<string, ImportMatchResult>>({});
  const [selections, setSelections] = useState<Record<string, ImportCandidate | null>>({});
  const [ignored, setIgnored] = useState<Record<string, boolean>>({});
  const [addBacklog, setAddBacklog] = useState(true);
  const [filter, setFilter] = useState<ImportFilterValue>("all");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<ImportCommitResponse | null>(null);
  const [extraCandidates, setExtraCandidates] = useState<Record<string, ImportCandidate[]>>({});
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Um novo filtro (ou import) volta a lista para a primeira página.
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [filter, entries]);

  const provider: ImportProviderInfo | undefined = providers?.find((item) => item.id === providerId);
  const providerNotes = provider
    ? (t(`providers.${provider.id}.notes`, {
      returnObjects: true,
      defaultValue: [],
    }) as unknown as string[])
    : [];
  const providerLabel = (item: ImportProviderInfo) =>
    t(`providers.${item.id}.label`, { defaultValue: item.label });

  const resetData = () => {
    setEntries([]);
    setCounts(null);
    setMatches({});
    setSelections({});
    setIgnored({});
    setFilter("all");
    setSummary(null);
    setProgress(null);
    setExtraCandidates({});
    setDetailKey(null);
    setLimit(PAGE_SIZE);
  };

  const handleSelectProvider = (item: ImportProviderInfo) => {
    setStep(1);
    setProviderId(item.id);
    setMediaType(item.mediaTypes[0] ?? null);
    setFile(null);
    setUsername("");
    resetData();
  };

  const runMatch = async (list: ImportEntry[]) => {
    if (!user || list.length === 0) return;
    setProgress({ done: 0, total: list.length });

    const nextMatches: Record<string, ImportMatchResult> = {};
    const nextSelections: Record<string, ImportCandidate | null> = {};

    for (let index = 0; index < list.length; index += MATCH_CHUNK) {
      const chunk = list.slice(index, index + MATCH_CHUNK);
      const results = await matchImport(
        chunk.map((entry) => ({
          key: entry.key,
          title: entry.title,
          year: entry.year,
          overview: entry.overview,
          mediaType: entry.mediaType,
          externalRefs: entry.externalRefs,
        })),
        user.id
      );
      for (const result of results) {
        nextMatches[result.key] = result;
        nextSelections[result.key] = result.match ?? null;
      }
      setMatches({ ...nextMatches });
      setSelections({ ...nextSelections });
      setProgress({ done: Math.min(index + chunk.length, list.length), total: list.length });
    }

    setProgress(null);
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

    setBusy(true);
    resetData();

    let previewEntries: ImportEntry[] = [];
    try {
      const preview = await parseImport(provider.id, {
        userId: user.id,
        file: file ?? undefined,
        username: username.trim() || undefined,
        mediaType: mediaType ?? undefined,
      });
      previewEntries = preview.entries;
      setEntries(preview.entries);
      setCounts(preview.counts);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.parse"));
      setBusy(false);
      return;
    }

    if (previewEntries.length === 0) {
      toast.error(t("errors.empty"));
      setBusy(false);
      return;
    }

    setStep(2);

    try {
      await runMatch(previewEntries);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.match"));
    } finally {
      setBusy(false);
    }
  };

  const handleSearch = useCallback(
    async (entry: ImportEntry, query: string): Promise<ImportCandidate[]> => {
      if (!user) return [];
      const results = await searchImportCandidates(query, entry.mediaType, user.id);
      setExtraCandidates((prev) => ({ ...prev, [entry.key]: results }));
      return results;
    },
    [user]
  );

  const handleSelectCandidate = useCallback((key: string, candidate: ImportCandidate) => {
    setSelections((prev) => ({ ...prev, [key]: candidate }));
  }, []);

  const handleToggleIgnored = useCallback((key: string) => {
    setIgnored((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleOpenDetails = useCallback((key: string) => {
    setDetailKey(key);
  }, []);

  const resultByKey = useMemo(
    () => new Map((summary?.items ?? []).map((item) => [item.key, item])),
    [summary]
  );

  const commitEntries = useMemo(
    () =>
      entries
        .filter((entry) => !ignored[entry.key] && selections[entry.key])
        .map((entry) => {
          const candidate = selections[entry.key]!;
          return {
            key: entry.key,
            mediaType: entry.mediaType,
            externalId: candidate.externalId,
            title: candidate.title,
            year: entry.year,
            coverUrl: candidate.coverUrl,
            overview: candidate.overview,
            releaseDate: candidate.releaseDate,
            status: entry.status,
            rating: entry.rating,
            review: entry.review,
            logs: entry.logs,
            addToBacklog: addBacklog && entry.inBacklog,
            backlogDate: entry.backlogDate,
          };
        }),
    [entries, ignored, selections, addBacklog]
  );

  const filterCounts = useMemo(() => {
    const next: Record<ImportFilterKey, number> = {
      log: 0,
      backlog: 0,
      validated: 0,
      attention: 0,
      errors: 0,
    };
    for (const entry of entries) {
      const match = matches[entry.key];
      const result = resultByKey.get(entry.key);
      if (entry.logs.length > 0) next.log += 1;
      if (addBacklog && entry.inBacklog) next.backlog += 1;
      // Itens ainda não casados não entram na contagem de status.
      if (match) {
        if (match.status === "matched" || match.status === "already_in_library") next.validated += 1;
        if (match.status === "ambiguous") next.attention += 1;
        if (match.status === "not_found") next.errors += 1;
      }
      if (result?.outcome === "failed") next.errors += 1;
    }
    return next;
  }, [entries, matches, addBacklog, resultByKey]);

  const visibleEntries = useMemo(() => {
    const activeFilter = filter;
    if (activeFilter === "all") return entries;
    return entries.filter((entry) => {
      const match = matches[entry.key];
      const result = resultByKey.get(entry.key);
      switch (activeFilter) {
        case "log":
          return entry.logs.length > 0;
        case "backlog":
          return addBacklog && entry.inBacklog;
        case "validated":
          return match?.status === "matched" || match?.status === "already_in_library";
        case "attention":
          return match?.status === "ambiguous";
        case "errors":
          return match?.status === "not_found" || result?.outcome === "failed";
        default:
          return true;
      }
    });
  }, [entries, matches, filter, addBacklog, resultByKey]);

  // Candidatos do match + resultados da busca manual, por item.
  const candidatesByKey = useMemo(() => {
    const map = new Map<string, ImportCandidate[]>();
    for (const entry of entries) {
      const seen = new Set<string>();
      const merged: ImportCandidate[] = [];
      for (const candidate of [
        ...(matches[entry.key]?.candidates ?? []),
        ...(extraCandidates[entry.key] ?? []),
      ]) {
        if (!seen.has(candidate.externalId)) {
          seen.add(candidate.externalId);
          merged.push(candidate);
        }
      }
      map.set(entry.key, merged);
    }
    return map;
  }, [entries, matches, extraCandidates]);

  const shownEntries = useMemo(() => visibleEntries.slice(0, limit), [visibleEntries, limit]);

  const handleCommit = async () => {
    if (!user || commitEntries.length === 0) {
      toast.error(t("errors.nothingSelected"));
      return;
    }
    setBusy(true);
    try {
      const result = await commitImport(commitEntries, user.id);
      setSummary(result);
      setStep(3);
      toast.success(t("commit.success", { count: result.imported + result.merged }));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["media"] }),
        queryClient.invalidateQueries({ queryKey: ["existingMedia"] }),
        queryClient.invalidateQueries({ queryKey: ["media-logs"] }),
        queryClient.invalidateQueries({ queryKey: ["backlog"] }),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.commit"));
    } finally {
      setBusy(false);
    }
  };

  const percent = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  const detailEntry = detailKey ? entries.find((entry) => entry.key === detailKey) : undefined;
  const detailCandidates = detailKey
    ? candidatesByKey.get(detailKey) ?? EMPTY_CANDIDATES
    : EMPTY_CANDIDATES;
  const detailSourceHref = detailEntry ? sourceUrl(detailEntry) : null;
  const detailSourceLabel = detailEntry
    ? t(`providers.${detailEntry.source}.label`, { defaultValue: detailEntry.source })
    : "";

  return (
    <div className="w-full space-y-5">
      <Card>
        <StepRail
          step={step}
          canReview={entries.length > 0}
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

                {provider.inputType === "username" && provider.mediaTypes.length > 1 && (
                  <SelectBase
                    value={mediaType ?? ""}
                    onValueChange={(value) => setMediaType(value as MediaTypeEnum)}
                  >
                    <SelectTrigger size="sm" className="max-w-52">
                      <SelectValue placeholder={t("input.mediaTypeLabel")} />
                    </SelectTrigger>
                    <SelectContent>
                      {provider.mediaTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`type.${type}`, { ns: "media" })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectBase>
                )}

                {provider.inputType === "file" ? (
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
                  disabled={busy}
                  className="w-full sm:w-auto"
                >
                  {busy && !progress ? <Loader2 className="animate-spin" /> : <Upload />}
                  {busy && !progress ? t("input.analyzing") : t("input.analyze")}
                </Button>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            {provider && entries.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border px-3 py-2">
                <p className="min-w-0 truncate text-step-1 text-muted-foreground">
                  {t("steps.summary", { provider: providerLabel(provider), count: entries.length })}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="shrink-0"
                >
                  {t("steps.edit")}
                </Button>
              </div>
            )}

            {progress && (
              <div className="space-y-1.5" role="status" aria-live="polite">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-step-1 text-muted-foreground">
                    {t("match.progress", { done: progress.done, total: progress.total })}
                  </p>
                  <span className="font-serif text-step-2 tabular-nums">{percent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )}

            {counts && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <StatCell label={t("counts.total")} value={counts.total} />
                <StatCell label={t("counts.withLogs")} value={counts.withLogs} />
                <StatCell label={t("counts.rated")} value={counts.rated} />
                <StatCell label={t("counts.reviewed")} value={counts.reviewed} />
                <StatCell label={t("counts.backlog")} value={counts.backlog} />
              </div>
            )}

            <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
              <ImportFilters value={filter} counts={filterCounts} onChange={setFilter} />
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
              {t("filters.showing", { shown: visibleEntries.length, total: entries.length })}
            </p>

            {visibleEntries.length > 0 ? (
              <div className="space-y-2">
                <div
                  ref={listTopRef}
                  className="scroll-mt-16 rounded-control border border-border px-3"
                >
                  {shownEntries.map((entry) => (
                    <EntryRow
                      key={entry.key}
                      entry={entry}
                      match={matches[entry.key]}
                      result={resultByKey.get(entry.key)}
                      selected={selections[entry.key] ?? null}
                      ignored={ignored[entry.key] ?? false}
                      willBacklog={addBacklog && entry.inBacklog}
                      pending={busy && !matches[entry.key]}
                      candidates={candidatesByKey.get(entry.key) ?? EMPTY_CANDIDATES}
                      onSelect={handleSelectCandidate}
                      onToggleIgnored={handleToggleIgnored}
                      onSearch={handleSearch}
                      onOpenDetails={handleOpenDetails}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  {visibleEntries.length > limit ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
                    >
                      {t("filters.showMore", { count: visibleEntries.length - limit })}
                    </Button>
                  ) : (
                    <span />
                  )}

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
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
                {t("commit.selected", { count: commitEntries.length })}
              </span>
              <Button
                type="button"
                onClick={handleCommit}
                disabled={busy || commitEntries.length === 0}
              >
                {busy ? <Loader2 className="animate-spin" /> : <Upload />}
                {busy ? t("commit.working") : t("commit.action", { count: commitEntries.length })}
              </Button>
            </div>
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
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
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
          match={detailKey ? matches[detailKey] : undefined}
          selected={detailKey ? selections[detailKey] ?? null : null}
          candidates={detailCandidates}
          sourceHref={detailSourceHref}
          sourceLabel={detailSourceLabel}
          onSelect={(candidate) => handleSelectCandidate(detailEntry.key, candidate)}
        />
      )}
    </div>
  );
}

export default ImportManager;
