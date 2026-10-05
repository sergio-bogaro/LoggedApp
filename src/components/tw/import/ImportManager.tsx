import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, SkipForward, Undo2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ImportFilters, type ImportFilterKey } from "@/components/tw/import/ImportFilters";
import { Button } from "@/components/ui/button";
import { BaseInput } from "@/components/ui/input";
import {
  SelectBase,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// A metadata é buscada em lotes para caber no timeout e mostrar progresso.
const MATCH_CHUNK = 50;

const STATUS_STYLES: Record<string, string> = {
  matched: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  ambiguous: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  not_found: "bg-destructive/15 text-destructive",
  already_in_library: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
};

const OUTCOME_STYLES: Record<string, string> = {
  imported: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  merged: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  skipped: "bg-muted text-muted-foreground",
  failed: "bg-destructive/15 text-destructive",
};

function CountBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-control border border-border px-3 py-1.5">
      <span className="font-serif text-step-2 tabular-nums">{value}</span>
      <span className="ml-1 text-step-0 text-muted-foreground">{label}</span>
    </div>
  );
}

function CategoryTag({ label, value }: { label: string; value?: number }) {
  return (
    <span className="rounded-control border border-border px-1.5 py-0.5">
      {label}
      {value !== undefined && <span className="ml-1 tabular-nums text-foreground">{value}</span>}
    </span>
  );
}

interface EntryRowProps {
  entry: ImportEntry;
  match?: ImportMatchResult;
  result?: ImportCommitItem;
  selected: ImportCandidate | null;
  ignored: boolean;
  willBacklog: boolean;
  onSelect: (candidate: ImportCandidate) => void;
  onToggleIgnored: () => void;
  onSearch: (query: string) => Promise<ImportCandidate[]>;
}

function EntryRow({
  entry,
  match,
  result,
  selected,
  ignored,
  willBacklog,
  onSelect,
  onToggleIgnored,
  onSearch,
}: EntryRowProps) {
  const { t } = useTranslation("import");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [extra, setExtra] = useState<ImportCandidate[]>([]);

  const candidates = useMemo(() => {
    const seen = new Set<string>();
    const merged: ImportCandidate[] = [];
    for (const candidate of [...(match?.candidates ?? []), ...extra]) {
      if (!seen.has(candidate.externalId)) {
        seen.add(candidate.externalId);
        merged.push(candidate);
      }
    }
    return merged;
  }, [match, extra]);

  const status = match?.status ?? "not_found";
  const hasLog = entry.logs.length > 0;
  const poster = selected?.coverUrl ?? match?.match?.coverUrl ?? null;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await onSearch(query.trim());
      setExtra(results);
      if (results.length === 0) toast.message(t("match.noResults"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.match"));
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex items-start gap-3 border-b border-border py-3 last:border-b-0">
      <div className="h-20 w-14 shrink-0 overflow-hidden rounded-control bg-muted">
        {poster && (
          <img src={poster} alt="" className="h-full w-full object-cover" loading="lazy" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-step-2">{entry.title}</span>
          {entry.year && <span className="text-step-0 text-muted-foreground">{entry.year}</span>}
          <span className={`rounded-control px-1.5 py-0.5 text-step-0 ${STATUS_STYLES[status]}`}>
            {t(`match.status.${status}`)}
          </span>
          {ignored && (
            <span className="rounded-control bg-muted px-1.5 py-0.5 text-step-0 text-muted-foreground">
              {t("match.ignored")}
            </span>
          )}
          {result && (
            <span className={`rounded-control px-1.5 py-0.5 text-step-0 ${OUTCOME_STYLES[result.outcome]}`}>
              {t(`result.${result.outcome}`)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-step-0 text-muted-foreground">
          {hasLog && <CategoryTag label={t("filters.log")} value={entry.logs.length} />}
          {willBacklog && <CategoryTag label={t("filters.backlog")} />}
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

        <div className="flex flex-wrap items-center gap-2">
          {candidates.length > 0 && (
            <SelectBase
              value={selected ? selected.externalId : ""}
              onValueChange={(value) => {
                const candidate = candidates.find((item) => item.externalId === value);
                if (candidate) onSelect(candidate);
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
        onClick={onToggleIgnored}
        className="text-muted-foreground"
      >
        {ignored ? <Undo2 /> : <SkipForward />}
        {ignored ? t("match.restore") : t("match.ignore")}
      </Button>
    </div>
  );
}

function ImportManager() {
  const { t } = useTranslation("import");
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const { data: providers } = useQuery({
    queryKey: ["import", "providers"],
    queryFn: listImportProviders,
    staleTime: Infinity,
  });

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
  const [filter, setFilter] = useState<ImportFilterKey[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<ImportCommitResponse | null>(null);

  const provider: ImportProviderInfo | undefined = providers?.find((item) => item.id === providerId);
  const providerLabel = (item: ImportProviderInfo) =>
    t(`providers.${item.id}.label`, { defaultValue: item.label });

  const resetData = () => {
    setEntries([]);
    setCounts(null);
    setMatches({});
    setSelections({});
    setIgnored({});
    setFilter([]);
    setSummary(null);
    setProgress(null);
  };

  const handleSelectProvider = (item: ImportProviderInfo) => {
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

    try {
      await runMatch(previewEntries);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.match"));
    } finally {
      setBusy(false);
    }
  };

  const handleSearch = async (entry: ImportEntry, query: string): Promise<ImportCandidate[]> => {
    if (!user) return [];
    return searchImportCandidates(query, entry.mediaType, user.id);
  };

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
      if (match?.status === "matched" || match?.status === "already_in_library") next.validated += 1;
      if (match?.status === "ambiguous") next.attention += 1;
      if (match?.status === "not_found" || result?.outcome === "failed") next.errors += 1;
    }
    return next;
  }, [entries, matches, addBacklog, resultByKey]);

  const visibleEntries = useMemo(() => {
    if (filter.length === 0) return entries;
    return entries.filter((entry) => {
      const match = matches[entry.key];
      const result = resultByKey.get(entry.key);
      return filter.every((key) => {
        switch (key) {
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
    });
  }, [entries, matches, filter, addBacklog, resultByKey]);

  const handleCommit = async () => {
    if (!user || commitEntries.length === 0) {
      toast.error(t("errors.nothingSelected"));
      return;
    }
    setBusy(true);
    try {
      const result = await commitImport(commitEntries, user.id);
      setSummary(result);
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

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-step-1">{t("input.chooseProvider")}</p>
        <div className="flex flex-wrap gap-2">
          {(providers ?? []).map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={item.id === providerId ? "default" : "outline"}
              onClick={() => handleSelectProvider(item)}
            >
              {providerLabel(item)}
            </Button>
          ))}
        </div>
      </div>

      {provider && (
        <div className="space-y-2 rounded-control border border-border p-3">
          <p className="text-step-1 text-muted-foreground">
            {t(`providers.${provider.id}.description`, { defaultValue: "" })}
          </p>
          <a
            href={t(`providers.${provider.id}.helpUrl`, { defaultValue: "" })}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "text-step-1 text-primary underline-offset-4 hover:underline",
              !t(`providers.${provider.id}.helpLabel`, { defaultValue: "" }) && "hidden"
            )}
          >
            {t(`providers.${provider.id}.helpLabel`, { defaultValue: "" })}
          </a>

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
            <div className="space-y-2">
              <label className="text-step-1" htmlFor="import-file">
                {t("input.fileLabel")}
              </label>
              <BaseInput
                id="import-file"
                name="import-file"
                type="file"
                accept={provider.accepts ?? undefined}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-step-1" htmlFor="import-username">
                {t("input.usernameLabel")}
              </label>
              <BaseInput
                id="import-username"
                name="import-username"
                value={username}
                placeholder={t(`providers.${provider.id}.usernamePlaceholder`, { defaultValue: "" })}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
          )}

          <Button type="button" onClick={handleAnalyze} disabled={busy}>
            {busy && !progress ? <Loader2 className="animate-spin" /> : <Upload />}
            {busy && !progress ? t("input.analyzing") : t("input.analyze")}
          </Button>
        </div>
      )}

      {progress && (
        <div className="space-y-1">
          <p className="text-step-1 text-muted-foreground">
            {t("match.progress", { done: progress.done, total: progress.total })}
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      {counts && (
        <div className="flex flex-wrap gap-2">
          <CountBadge label={t("counts.total")} value={counts.total} />
          <CountBadge label={t("counts.withLogs")} value={counts.withLogs} />
          <CountBadge label={t("counts.rated")} value={counts.rated} />
          <CountBadge label={t("counts.reviewed")} value={counts.reviewed} />
          <CountBadge label={t("counts.backlog")} value={counts.backlog} />
        </div>
      )}

      {entries.length > 0 && (
        <>
          <label className="flex items-center gap-2 text-step-1">
            <input
              type="checkbox"
              checked={addBacklog}
              onChange={(event) => setAddBacklog(event.target.checked)}
              className="size-4 accent-primary"
            />
            {t("options.backlog")}
          </label>

          <div className="space-y-2">
            <ImportFilters
              counts={filterCounts}
              active={filter}
              onToggle={(key) =>
                setFilter((prev) =>
                  prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
                )
              }
              onClear={() => setFilter([])}
            />
            <p className="text-step-0 text-muted-foreground">
              {t("filters.showing", { shown: visibleEntries.length, total: entries.length })}
            </p>
          </div>

          {visibleEntries.length > 0 ? (
            <div className={cn("max-h-[36rem] overflow-y-auto rounded-control border border-border px-3")}>
              {visibleEntries.map((entry) => (
                <EntryRow
                  key={entry.key}
                  entry={entry}
                  match={matches[entry.key]}
                  result={resultByKey.get(entry.key)}
                  selected={selections[entry.key] ?? null}
                  ignored={ignored[entry.key] ?? false}
                  willBacklog={addBacklog && entry.inBacklog}
                  onSelect={(candidate) =>
                    setSelections((prev) => ({ ...prev, [entry.key]: candidate }))
                  }
                  onToggleIgnored={() =>
                    setIgnored((prev) => ({ ...prev, [entry.key]: !prev[entry.key] }))
                  }
                  onSearch={(query) => handleSearch(entry, query)}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-control border border-border p-3 text-step-1 text-muted-foreground">
              {t("filters.empty")}
            </p>
          )}

          <Button type="button" onClick={handleCommit} disabled={busy || commitEntries.length === 0}>
            {busy ? <Loader2 className="animate-spin" /> : <Upload />}
            {busy
              ? t("commit.working")
              : t("commit.action", { count: commitEntries.length })}
          </Button>
        </>
      )}

      {summary && (
        <div className="space-y-1 rounded-control border border-border p-3">
          <p className="font-serif text-step-3">{t("summary.title")}</p>
          <p className="text-step-1 text-muted-foreground">
            {t("summary.counts", {
              imported: summary.imported,
              merged: summary.merged,
              skipped: summary.skipped,
              logs: summary.logsCreated,
              backlog: summary.backlogAdded,
            })}
          </p>
          {summary.failures.length > 0 && (
            <details className="text-step-1">
              <summary className="cursor-pointer text-destructive">
                {t("summary.failures", { count: summary.failures.length })}
              </summary>
              <ul className="mt-1 list-disc pl-5 text-muted-foreground">
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
        </div>
      )}
    </div>
  );
}

export default ImportManager;
