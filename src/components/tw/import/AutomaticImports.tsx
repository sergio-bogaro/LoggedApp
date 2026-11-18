import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink,
  ImageOff,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  SkipForward,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ImportOutcomeMark } from "@/components/tw/import/ImportStatusMark";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  SelectBase,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type SyncSuggestionFilter,
  useSyncSuggestions,
} from "@/hooks/useSyncSuggestions";
import { cn } from "@/lib/utils";
import { searchImportCandidates } from "@/querries/import";
import {
  approveSyncSuggestions,
  saveSyncSuggestionCandidate,
  updateSyncSuggestion,
} from "@/querries/librarySync";
import { useAppSelector } from "@/store/auth/hooks";
import type { ImportCandidate } from "@/types/import";
import type { SyncSuggestion } from "@/types/librarySync";
import { metadataProviderKey, metadataUrl } from "@/utils/importLinks";

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00`
    : /[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
      ? value
      : `${value}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function SuggestionMatchMark({
  kind,
}: {
  kind: "exact" | "validation" | "none";
}) {
  const { t } = useTranslation("import");
  const tone =
    kind === "exact"
      ? {
          text: "text-foreground",
          mark: "border-primary bg-primary",
        }
      : kind === "validation"
        ? {
            text: "text-amber-600 dark:text-amber-400",
            mark: "border-amber-500 bg-transparent",
          }
        : {
            text: "text-destructive",
            mark: "border-destructive bg-transparent",
          };

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-step-0", tone.text)}>
      <span
        aria-hidden="true"
        className={cn("size-2 shrink-0 rounded-[2px] border", tone.mark)}
      />
      {t(`automatic.match.${kind}`)}
    </span>
  );
}

function SuggestionMatchDialog({
  suggestion,
  saving,
  onClose,
  onSelect,
}: {
  suggestion: SyncSuggestion;
  saving: boolean;
  onClose: () => void;
  onSelect: (candidate: ImportCandidate) => void;
}) {
  const { t } = useTranslation(["import", "librarySync"]);
  const { user } = useAppSelector((state) => state.auth);
  const [query, setQuery] = useState(suggestion.title);
  const [search, setSearch] = useState(suggestion.title.trim());

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const { data, isFetching } = useQuery({
    queryKey: [
      "import",
      "suggestion-search",
      user?.id,
      suggestion.mediaType,
      search,
    ],
    queryFn: () =>
      searchImportCandidates(search, suggestion.mediaType, user!.id),
    enabled: !!user && search.length >= 2,
    refetchOnWindowFocus: false,
  });

  const candidates = data ?? [];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8">{t("automatic.searchMatchTitle")}</DialogTitle>
          <DialogDescription>
            {t("automatic.searchMatchDescription")}
          </DialogDescription>
        </DialogHeader>

        <p className="text-step-1 font-medium">{suggestion.title}</p>

        <Input
          name="suggestion-match-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("automatic.searchMatchPlaceholder")}
          autoFocus
        />

        {search.length < 2 ? null : isFetching ? (
          <p className="flex items-center gap-2 text-step-1 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {t("automatic.searchingMatches")}
          </p>
        ) : candidates.length === 0 ? (
          <p className="rounded-control border border-dashed border-border p-3 text-step-1 text-muted-foreground">
            {t("automatic.noMatchCandidates")}
          </p>
        ) : (
          <ul className="space-y-2">
            {candidates.map((candidate) => {
              const selected =
                suggestion.candidate?.externalId === candidate.externalId;
              return (
                <li
                  key={candidate.externalId}
                  className={cn(
                    "flex items-center gap-3 rounded-control border border-border p-2",
                    selected && "border-primary"
                  )}
                >
                  <div className="h-16 w-11 shrink-0 overflow-hidden rounded-control bg-muted">
                    {candidate.coverUrl ? (
                      <img
                        src={candidate.coverUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-step-1">
                      {candidate.title}
                      {candidate.year ? ` (${candidate.year})` : ""}
                    </p>
                    <p className="text-step-0 text-muted-foreground">
                      {t(metadataProviderKey(candidate.provider), {
                        defaultValue: candidate.provider,
                      })}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="xs"
                    variant={selected ? "default" : "outline"}
                    disabled={saving}
                    onClick={() => onSelect(candidate)}
                  >
                    {saving ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Search />
                    )}
                    {t("automatic.selectMatch")}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuggestionRow({
  suggestion,
  selected,
  selectable,
  busy,
  onToggle,
  onSelectCandidate,
  onFindMatch,
  onDismiss,
  onRestore,
}: {
  suggestion: SyncSuggestion;
  selected: boolean;
  selectable: boolean;
  busy: boolean;
  onToggle: () => void;
  onSelectCandidate: (candidate: ImportCandidate) => void;
  onFindMatch: () => void;
  onDismiss: () => void;
  onRestore: () => void;
}) {
  const { t } = useTranslation(["import", "librarySync", "media"]);
  const pending = suggestion.reviewState === "pending";
  const approved = suggestion.reviewState === "approved";
  const cover = suggestion.candidate?.coverUrl;
  const candidates =
    suggestion.candidates.length > 0
      ? suggestion.candidates
      : suggestion.candidate
        ? [suggestion.candidate]
        : [];
  const matchKind = !suggestion.candidate
    ? "none"
    : suggestion.error
      ? "validation"
      : "exact";
  const target =
    suggestion.action === "backlog"
      ? t("actions.backlog", { ns: "librarySync" })
      : suggestion.targetStatus
        ? t(`status.${suggestion.targetStatus}`, { ns: "media" })
        : suggestion.action;
  const sourceHref = suggestion.sourceUrl;
  const metaHref = suggestion.candidate
    ? metadataUrl(suggestion.candidate)
    : null;
  const watched = formatDate(suggestion.watchedDate);
  const sourceLabel =
    suggestion.provider === "suwayomi"
      ? t(`actions.${suggestion.action}`, {
        ns: "librarySync",
        defaultValue: suggestion.sourceLabel || suggestion.sourceStatus,
      })
      : t(
        `providers.${suggestion.provider}.statuses.${suggestion.sourceStatus}`,
        {
          ns: "librarySync",
          defaultValue:
              suggestion.sourceLabel || suggestion.sourceStatus,
        }
      );

  return (
    <div
      className={cn(
        "flex gap-3 border-b border-border p-3 last:border-b-0",
        !pending && "opacity-60"
      )}
    >
      {pending && selectable ? (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-1 size-4 shrink-0 accent-primary"
          aria-label={suggestion.title}
        />
      ) : (
        <span className="mt-1 size-4 shrink-0" />
      )}

      <div className="h-20 w-14 shrink-0 overflow-hidden rounded-control bg-muted">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-4" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="break-words text-step-1 font-medium">
          {suggestion.title}
          {suggestion.year ? (
            <span className="ml-2 tabular-nums text-muted-foreground">
              {suggestion.year}
            </span>
          ) : null}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {pending && <SuggestionMatchMark kind={matchKind} />}
          {approved && (
            <>
              <ImportOutcomeMark outcome="imported" />
              <span className="text-step-0 text-muted-foreground">
                {t(
                  suggestion.origin === "auto"
                    ? "automatic.autoOrigin"
                    : "automatic.reviewOrigin"
                )}
              </span>
            </>
          )}
          {!pending && !approved && (
            <span className="text-step-0 text-muted-foreground">
              {t("automatic.dismissedState")}
            </span>
          )}
        </div>

        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-step-0 text-muted-foreground">
          <span>
            {t(`providers.${suggestion.provider}.label`, {
              ns: "librarySync",
              defaultValue: suggestion.provider,
            })}
          </span>
          <span>
            {sourceLabel} → {target}
          </span>
          {watched && <span>{t("automatic.watched", { date: watched })}</span>}
          {suggestion.rating != null && (
            <span>{t("automatic.rating", { value: suggestion.rating.toFixed(1) })}</span>
          )}
        </p>

        {suggestion.review && (
          <p className="line-clamp-2 text-step-0 text-muted-foreground">
            {suggestion.review}
          </p>
        )}

        {suggestion.error && (
          <p className="text-step-0 text-amber-600 dark:text-amber-400">
            {suggestion.error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-step-0">
          {sourceHref && (
            <a
              href={sourceHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
            >
              {t("automatic.openSource")}
              <ExternalLink className="size-3" />
            </a>
          )}
          {metaHref && (
            <a
              href={metaHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
            >
              {t("automatic.openMetadata")}
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>

        {pending && candidates.length > 0 && (
          <SelectBase
            value={suggestion.candidate?.externalId ?? ""}
            onValueChange={(value) => {
              const candidate = candidates.find(
                (item) => item.externalId === value
              );
              if (candidate) onSelectCandidate(candidate);
            }}
          >
            <SelectTrigger size="sm" className="max-w-72">
              <SelectValue placeholder={t("automatic.chooseMatch")} />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((candidate) => (
                <SelectItem
                  key={candidate.externalId}
                  value={candidate.externalId}
                >
                  {candidate.title} ({candidate.year ?? "—"})
                </SelectItem>
              ))}
            </SelectContent>
          </SelectBase>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {pending && (
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={onFindMatch}
            disabled={busy}
          >
            <Search />
            {t(
              suggestion.candidate
                ? "automatic.changeMatch"
                : "automatic.findMatch"
            )}
          </Button>
        )}
        {!approved && (
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={pending ? onDismiss : onRestore}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="animate-spin" />
            ) : pending ? (
              <SkipForward />
            ) : (
              <RotateCcw />
            )}
            {t(pending ? "automatic.dismiss" : "automatic.restore")}
          </Button>
        )}
      </div>
    </div>
  );
}

export function AutomaticImports({ provider }: { provider?: string }) {
  const { t } = useTranslation(["import", "librarySync", "media"]);
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<SyncSuggestionFilter>("pending");
  const [deselected, setDeselected] = useState<Set<number>>(new Set());
  const [approving, setApproving] = useState(false);
  const [rowBusy, setRowBusy] = useState<number | null>(null);
  const [matchSuggestion, setMatchSuggestion] = useState<SyncSuggestion | null>(
    null
  );
  const [savingMatch, setSavingMatch] = useState(false);

  const suggestionsQuery = useSyncSuggestions(user?.id, filter, provider);
  const data = suggestionsQuery.data?.pages[0];
  const allItems = useMemo(
    () => suggestionsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [suggestionsQuery.data]
  );
  const counts = data?.counts;
  const isLoading = suggestionsQuery.isLoading;
  const pendingItems = useMemo(
    () => allItems.filter((item) => item.reviewState === "pending"),
    [allItems]
  );
  const readyItems = useMemo(
    () => pendingItems.filter((item) => item.candidate && !item.error),
    [pendingItems]
  );
  const attentionItems = useMemo(
    () => pendingItems.filter((item) => item.candidate && item.error),
    [pendingItems]
  );
  const noMatchItems = useMemo(
    () => pendingItems.filter((item) => !item.candidate),
    [pendingItems]
  );
  const items = useMemo(
    () =>
      filter === "ready"
        ? readyItems
        : filter === "attention"
          ? attentionItems
          : filter === "no_match"
            ? noMatchItems
            : allItems,
    [filter, readyItems, attentionItems, noMatchItems, allItems]
  );
  const selectableItems =
    filter === "attention" ? attentionItems : readyItems;
  const selectedIds = useMemo(
    () =>
      selectableItems
        .filter((item) => !deselected.has(item.id))
        .map((item) => item.id),
    [selectableItems, deselected]
  );
  const canBulkSelect =
    filter === "pending" ||
    filter === "ready" ||
    filter === "attention" ||
    filter === "all";

  const filterCounts: Record<SyncSuggestionFilter, number> = {
    pending: counts?.pending ?? 0,
    ready: counts?.ready ?? 0,
    all:
      (counts?.pending ?? 0) +
      (counts?.approved ?? 0) +
      (counts?.dismissed ?? 0),
    validated: counts?.approved ?? 0,
    last_sync: counts?.lastSync ?? 0,
    attention: counts?.attention ?? 0,
    no_match: counts?.noMatch ?? 0,
    dismissed: counts?.dismissed ?? 0,
  };

  const filterOptions: { value: SyncSuggestionFilter; labelKey: string }[] = [
    { value: "pending", labelKey: "automatic.filters.pending" },
    { value: "ready", labelKey: "automatic.filters.ready" },
    { value: "attention", labelKey: "automatic.filters.attention" },
    { value: "no_match", labelKey: "automatic.filters.noMatch" },
    { value: "all", labelKey: "automatic.filters.all" },
    { value: "validated", labelKey: "automatic.filters.validated" },
    { value: "last_sync", labelKey: "automatic.filters.lastSync" },
    { value: "dismissed", labelKey: "automatic.filters.dismissed" },
  ];

  useEffect(() => {
    setDeselected(new Set());
  }, [filter, provider]);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["sync-suggestions"] }),
      queryClient.invalidateQueries({ queryKey: ["integrations"] }),
      queryClient.invalidateQueries({ queryKey: ["media"] }),
      queryClient.invalidateQueries({ queryKey: ["existingMedia"] }),
      queryClient.invalidateQueries({ queryKey: ["media-logs"] }),
      queryClient.invalidateQueries({ queryKey: ["backlog"] }),
      queryClient.invalidateQueries({ queryKey: ["suwayomi", "links"] }),
      queryClient.invalidateQueries({ queryKey: ["suwayomi", "config"] }),
    ]);
  };

  const toggle = (id: number) => {
    setDeselected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApprove = async () => {
    if (!user || selectedIds.length === 0) return;
    setApproving(true);
    try {
      const result = await approveSyncSuggestions(user.id, selectedIds);
      await invalidate();
      setDeselected(new Set());
      if (result.failed > 0) {
        toast.error(
          t("automatic.approvePartial", {
            approved: result.approved,
            failed: result.failed,
          })
        );
      } else {
        toast.success(
          t("automatic.approveSuccess", { count: result.approved })
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("automatic.error"));
    } finally {
      setApproving(false);
    }
  };

  const handleSaveMatch = async (
    suggestion: SyncSuggestion,
    candidate: ImportCandidate
  ) => {
    if (!user) return;
    setSavingMatch(true);
    try {
      await saveSyncSuggestionCandidate(user.id, suggestion.id, candidate);
      await invalidate();
      setMatchSuggestion(null);
      toast.success(t("automatic.matchSaved"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("automatic.matchError")
      );
    } finally {
      setSavingMatch(false);
    }
  };

  const handleState = async (
    suggestion: SyncSuggestion,
    nextState: "pending" | "dismissed"
  ) => {
    if (!user) return;
    setRowBusy(suggestion.id);
    try {
      await updateSyncSuggestion(user.id, suggestion.id, nextState);
      await invalidate();
      toast.success(
        t(nextState === "dismissed" ? "automatic.dismissed" : "automatic.restored")
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("automatic.error"));
    } finally {
      setRowBusy(null);
    }
  };

  const renderRow = (
    suggestion: SyncSuggestion,
    selectable: boolean
  ) => (
    <SuggestionRow
      key={suggestion.id}
      suggestion={suggestion}
      selected={!deselected.has(suggestion.id)}
      selectable={selectable}
      busy={rowBusy === suggestion.id}
      onToggle={() => toggle(suggestion.id)}
      onSelectCandidate={(candidate) =>
        void handleSaveMatch(suggestion, candidate)
      }
      onFindMatch={() => setMatchSuggestion(suggestion)}
      onDismiss={() => void handleState(suggestion, "dismissed")}
      onRestore={() => void handleState(suggestion, "pending")}
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-step-1">
            {t("automatic.title")}
            {(counts?.pending ?? 0) > 0 ? (
              <span className="ml-1 tabular-nums text-muted-foreground">
                ({counts?.pending})
              </span>
            ) : null}
          </p>
          <p className="text-step-0 text-muted-foreground">
            {t("automatic.description")}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-step-0 text-muted-foreground" htmlFor="suggestion-filter">
            {t("automatic.filters.label")}
          </label>
          <SelectBase
            value={filter}
            onValueChange={(value) =>
              setFilter(value as SyncSuggestionFilter)
            }
          >
            <SelectTrigger size="sm" id="suggestion-filter" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                  <span className="ml-1 tabular-nums text-muted-foreground">
                    ({filterCounts[option.value]})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </SelectBase>
        </div>
      </div>

      {filter === "last_sync" && data?.lastSyncAt && (
        <p className="text-step-0 text-muted-foreground">
          {t("automatic.lastSyncAt", {
            date: formatDate(data.lastSyncAt),
          })}
        </p>
      )}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : items.length === 0 ? (
        <div className="rounded-control border border-dashed border-border p-6 text-center">
          <p className="text-step-1 font-medium">
            {t(
              filter === "dismissed"
                ? "automatic.emptyDismissed"
                : filter === "validated" || filter === "last_sync"
                  ? "automatic.emptyHistory"
                  : "automatic.emptyPending"
            )}
          </p>
          <p className="mt-1 text-step-0 text-muted-foreground">
            {t("automatic.emptyHint")}
          </p>
        </div>
      ) : (
        <>
          {canBulkSelect && selectableItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-step-0 text-muted-foreground">
                {t("automatic.selected", { count: selectedIds.length })}
              </p>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => setDeselected(new Set())}
                disabled={selectedIds.length === selectableItems.length}
              >
                {t("automatic.selectAll")}
              </Button>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() =>
                  setDeselected(
                    new Set(selectableItems.map((item) => item.id))
                  )
                }
                disabled={selectedIds.length === 0}
              >
                {t("automatic.clearSelection")}
              </Button>
              <Button
                type="button"
                size="sm"
                className="ml-auto"
                onClick={handleApprove}
                disabled={approving || selectedIds.length === 0}
              >
                {approving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Plus />
                )}
                {approving
                  ? t("automatic.approving")
                  : t("automatic.approve", { count: selectedIds.length })}
              </Button>
            </div>
          )}

          <div className="rounded-control border border-border">
            {items.map((suggestion) =>
              renderRow(
                suggestion,
                suggestion.reviewState === "pending" &&
                  (filter === "attention"
                    ? Boolean(suggestion.candidate && suggestion.error)
                    : Boolean(suggestion.candidate && !suggestion.error))
              )
            )}
          </div>

          {suggestionsQuery.hasNextPage && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void suggestionsQuery.fetchNextPage()}
              disabled={suggestionsQuery.isFetchingNextPage}
            >
              {suggestionsQuery.isFetchingNextPage && (
                <Loader2 className="animate-spin" />
              )}
              {t("automatic.loadMore")}
            </Button>
          )}
        </>
      )}

      {matchSuggestion && (
        <SuggestionMatchDialog
          suggestion={matchSuggestion}
          saving={savingMatch}
          onClose={() => setMatchSuggestion(null)}
          onSelect={(candidate) =>
            void handleSaveMatch(matchSuggestion, candidate)
          }
        />
      )}
    </div>
  );
}
