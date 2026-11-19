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
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
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
import { useReviewItems } from "@/hooks/useReviewItems";
import { cn } from "@/lib/utils";
import { searchImportCandidates } from "@/querries/import";
import {
  commitReviewItems,
  patchReviewItem,
  setReviewState,
} from "@/querries/review";
import { useAppSelector } from "@/store/auth/hooks";
import type { ImportCandidate } from "@/types/import";
import type { ReviewCounts, ReviewItem, ReviewMatch } from "@/types/review";
import { metadataProviderKey, metadataUrl } from "@/utils/importLinks";

type ReviewFilter =
  | "pending"
  | "ready"
  | "needs_validation"
  | "no_match"
  | "approved"
  | "dismissed"
  | "all";

type SourceFilter = "all" | "manual" | "sync";

const FILTERS: { value: ReviewFilter; labelKey: string }[] = [
  { value: "pending", labelKey: "review.filters.pending" },
  { value: "ready", labelKey: "review.filters.ready" },
  { value: "needs_validation", labelKey: "review.filters.needsValidation" },
  { value: "no_match", labelKey: "review.filters.noMatch" },
  { value: "approved", labelKey: "review.filters.approved" },
  { value: "dismissed", labelKey: "review.filters.dismissed" },
  { value: "all", labelKey: "review.filters.all" },
];

const MATCH_KEYS: Record<ReviewMatch, string> = {
  ready: "automatic.match.exact",
  needs_validation: "automatic.match.validation",
  no_match: "automatic.match.none",
  already_in_library: "automatic.match.alreadyInLibrary",
};

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

function ReviewMatchMark({ match }: { match: ReviewMatch }) {
  const { t } = useTranslation("import");
  const tone =
    match === "ready"
      ? { text: "text-foreground", mark: "border-primary bg-primary" }
      : match === "already_in_library"
        ? {
          text: "text-muted-foreground",
          mark: "border-muted-foreground bg-muted-foreground",
        }
        : match === "needs_validation"
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
      {t(MATCH_KEYS[match])}
    </span>
  );
}

function MatchDialog({
  item,
  saving,
  onClose,
  onSelect,
}: {
  item: ReviewItem;
  saving: boolean;
  onClose: () => void;
  onSelect: (candidate: ImportCandidate) => void;
}) {
  const { t } = useTranslation(["import", "librarySync"]);
  const { user } = useAppSelector((state) => state.auth);
  const [query, setQuery] = useState(item.title);
  const [search, setSearch] = useState(item.title.trim());

  const { data, isFetching } = useQuery({
    queryKey: [
      "import",
      "review-search",
      user?.id,
      item.mediaType,
      search,
    ],
    queryFn: () =>
      searchImportCandidates(search, item.mediaType, user!.id),
    enabled: !!user && search.length >= 2,
    refetchOnWindowFocus: false,
  });

  const candidates = data ?? [];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8">
            {t("automatic.searchMatchTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("automatic.searchMatchDescription")}
          </DialogDescription>
        </DialogHeader>

        <p className="text-step-1 font-medium">{item.title}</p>

        <Input
          name="review-match-search"
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
                item.selected?.externalId === candidate.externalId;
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

function ReviewRow({
  item,
  selected,
  selectable,
  busy,
  onToggle,
  onSelectCandidate,
  onFindMatch,
  onDismiss,
  onRestore,
}: {
  item: ReviewItem;
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
  const pending = item.state === "pending";
  const approved = item.state === "approved";
  const failed = item.state === "failed";
  const canRestore =
    item.state === "dismissed" &&
    (item.source === "sync" || item.jobStatus === "ready");
  const outcome: "imported" | "merged" | "skipped" | "failed" =
    item.commitOutcome === "merged"
      ? "merged"
      : item.commitOutcome === "skipped"
        ? "skipped"
        : item.commitOutcome === "failed"
          ? "failed"
          : "imported";
  const cover = item.coverUrl;
  const candidateMap = new Map<string, ImportCandidate>();
  for (const candidate of [
    ...item.candidates,
    item.candidate,
    item.selected,
  ]) {
    if (candidate) candidateMap.set(candidate.externalId, candidate);
  }
  const candidates = [...candidateMap.values()];
  const target =
    item.action === "backlog"
      ? t("actions.backlog", { ns: "librarySync" })
      : item.targetStatus
        ? t(`status.${item.targetStatus}`, { ns: "media" })
        : item.action;
  const sourceHref = item.sourceUrl;
  const selectedCandidate = item.selected ?? item.candidate;
  const metaHref = selectedCandidate ? metadataUrl(selectedCandidate) : null;
  const watched = formatDate(item.watchedDate);
  const sourceKind =
    item.source === "manual"
      ? t("review.source.manual")
      : t("review.source.sync");
  const providerLabel =
    item.source === "manual"
      ? t(`providers.${item.provider}.label`, {
        defaultValue: item.provider,
      })
      : t(`providers.${item.provider}.label`, {
        ns: "librarySync",
        defaultValue: item.provider,
      });

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
          aria-label={item.title}
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
          {item.title}
          {item.year ? (
            <span className="ml-2 tabular-nums text-muted-foreground">
              {item.year}
            </span>
          ) : null}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {pending ? <ReviewMatchMark match={item.match} /> : null}
          {approved && (
            <>
              <ImportOutcomeMark outcome={outcome} />
              <span className="text-step-0 text-muted-foreground">
                {t("automatic.reviewOrigin")}
              </span>
            </>
          )}
          {failed && <ImportOutcomeMark outcome="failed" />}
          {item.state === "dismissed" && (
            <span className="text-step-0 text-muted-foreground">
              {t("automatic.dismissedState")}
            </span>
          )}
        </div>

        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-step-0 text-muted-foreground">
          <span>{sourceKind}</span>
          {item.jobId ? (
            <span>{t("review.job", { id: item.jobId })}</span>
          ) : null}
          <span>
            {providerLabel} → {target}
          </span>
          {watched && <span>{t("automatic.watched", { date: watched })}</span>}
          {item.rating != null && (
            <span>{t("automatic.rating", { value: item.rating.toFixed(1) })}</span>
          )}
        </p>

        {item.review && (
          <p className="line-clamp-2 text-step-0 text-muted-foreground">
            {item.review}
          </p>
        )}

        {item.error && (
          <p className="text-step-0 text-amber-600 dark:text-amber-400">
            {item.error}
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
            value={selectedCandidate?.externalId ?? ""}
            onValueChange={(value) => {
              const candidate = candidates.find(
                (entry) => entry.externalId === value
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
              item.candidate
                ? "automatic.changeMatch"
                : "automatic.findMatch"
            )}
          </Button>
        )}
        {pending && (
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={onDismiss}
            disabled={busy}
          >
            {busy ? <Loader2 className="animate-spin" /> : <SkipForward />}
            {t("automatic.dismiss")}
          </Button>
        )}
        {canRestore && (
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={onRestore}
            disabled={busy}
          >
            {busy ? <Loader2 className="animate-spin" /> : <RotateCcw />}
            {t("automatic.restore")}
          </Button>
        )}
      </div>
    </div>
  );
}

export function UnifiedReviewInbox({ provider }: { provider?: string }) {
  const { t } = useTranslation(["import", "librarySync", "media"]);
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filter, setFilter] = useState<ReviewFilter>("pending");
  const [source, setSource] = useState<SourceFilter>("all");
  const [deselected, setDeselected] = useState<Set<string>>(new Set());
  const [approving, setApproving] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [matchItem, setMatchItem] = useState<ReviewItem | null>(null);
  const [savingMatch, setSavingMatch] = useState(false);

  const params = useMemo(() => {
    const base = { source, provider };
    if (filter === "pending") return { ...base, state: "pending" as const };
    if (filter === "approved") return { ...base, state: "approved" as const };
    if (filter === "dismissed") return { ...base, state: "dismissed" as const };
    if (filter === "all") return { ...base, state: "all" as const };
    const match = filter === "needs_validation" ? "needs_validation" : filter;
    return { ...base, state: "pending" as const, match: match as ReviewMatch };
  }, [filter, source, provider]);

  const query = useReviewItems(user?.id, params);
  const data = query.data?.pages[0];
  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );
  const counts: ReviewCounts | undefined = data?.counts;
  const isLoading = query.isLoading;
  const selectableItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.state === "pending" && Boolean(item.candidate || item.selected)
      ),
    [items]
  );
  const selectedKeys = useMemo(
    () =>
      selectableItems
        .filter((item) => !deselected.has(item.key))
        .map((item) => item.key),
    [selectableItems, deselected]
  );
  const canBulkApprove =
    filter === "pending" ||
    filter === "ready" ||
    filter === "needs_validation" ||
    filter === "all";
  const hasManualSelected = selectedKeys.some((key) => key.startsWith("manual:"));
  const providerLabel = provider
    ? t(`providers.${provider}.label`, {
      ns: "librarySync",
      defaultValue: provider,
    })
    : null;

  const clearProvider = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("provider");
    setSearchParams(next);
  };

  const filterCounts: Record<ReviewFilter, number> = {
    pending: counts?.pending ?? 0,
    ready: counts?.ready ?? 0,
    needs_validation: counts?.needsValidation ?? 0,
    no_match: counts?.noMatch ?? 0,
    approved: counts?.approved ?? 0,
    dismissed: counts?.dismissed ?? 0,
    all:
      (counts?.pending ?? 0) +
      (counts?.approved ?? 0) +
      (counts?.dismissed ?? 0) +
      (counts?.failed ?? 0),
  };

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["review"] }),
      queryClient.invalidateQueries({ queryKey: ["integrations"] }),
      queryClient.invalidateQueries({ queryKey: ["import-jobs"] }),
      queryClient.invalidateQueries({ queryKey: ["media"] }),
      queryClient.invalidateQueries({ queryKey: ["existingMedia"] }),
      queryClient.invalidateQueries({ queryKey: ["media-logs"] }),
      queryClient.invalidateQueries({ queryKey: ["backlog"] }),
      queryClient.invalidateQueries({ queryKey: ["suwayomi", "links"] }),
      queryClient.invalidateQueries({ queryKey: ["suwayomi", "config"] }),
    ]);
  };

  const toggle = (key: string) => {
    setDeselected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCommit = async () => {
    if (!user || selectedKeys.length === 0) return;
    setApproving(true);
    try {
      const result = await commitReviewItems(user.id, selectedKeys, true);
      await invalidate();
      setDeselected(new Set());
      if (result.failed > 0) {
        toast.error(
          t("automatic.approvePartial", {
            approved: result.imported + result.merged,
            failed: result.failed,
          })
        );
      } else {
        toast.success(
          t("automatic.approveSuccess", {
            count: result.imported + result.merged,
          })
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("automatic.error"));
    } finally {
      setApproving(false);
    }
  };

  const handleSaveMatch = async (
    item: ReviewItem,
    candidate: ImportCandidate
  ) => {
    if (!user) return;
    setSavingMatch(true);
    try {
      await patchReviewItem(item.key, user.id, { selected: candidate });
      await invalidate();
      setMatchItem(null);
      toast.success(t("automatic.matchSaved"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("automatic.matchError")
      );
    } finally {
      setSavingMatch(false);
    }
  };

  const handleState = async (item: ReviewItem, next: "pending" | "dismissed") => {
    if (!user) return;
    setRowBusy(item.key);
    try {
      await setReviewState(user.id, [item.key], next);
      await invalidate();
      toast.success(
        t(next === "dismissed" ? "automatic.dismissed" : "automatic.restored")
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("automatic.error"));
    } finally {
      setRowBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-step-1">{t("review.inbox.title")}</p>
          <p className="text-step-0 text-muted-foreground">
            {t("review.inbox.description")}
          </p>
          {(counts?.pending ?? 0) > 0 ? (
            <p className="text-step-0 text-muted-foreground">
              {t("review.inbox.pendingItems", { count: counts?.pending })}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label
              className="text-step-0 text-muted-foreground"
              htmlFor="review-source-filter"
            >
              {t("review.filters.source")}
            </label>
            <SelectBase
              value={source}
              onValueChange={(value) => setSource(value as SourceFilter)}
            >
              <SelectTrigger size="sm" id="review-source-filter" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("review.filters.allSources")}</SelectItem>
                <SelectItem value="manual">{t("review.source.manual")}</SelectItem>
                <SelectItem value="sync">{t("review.source.sync")}</SelectItem>
              </SelectContent>
            </SelectBase>
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-step-0 text-muted-foreground"
              htmlFor="review-filter"
            >
              {t("review.filters.label")}
            </label>
            <SelectBase
              value={filter}
              onValueChange={(value) => setFilter(value as ReviewFilter)}
            >
              <SelectTrigger size="sm" id="review-filter" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTERS.map((option) => (
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

          {providerLabel && (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={clearProvider}
            >
              {t("review.filters.clearProvider", { provider: providerLabel })}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : items.length === 0 ? (
        <div className="rounded-control border border-dashed border-border p-6 text-center">
          <p className="text-step-1 font-medium">
            {t(
              filter === "approved" || filter === "dismissed" || filter === "all"
                ? "review.empty.history"
                : "review.empty.pending"
            )}
          </p>
          <p className="mt-1 text-step-0 text-muted-foreground">
            {t("review.empty.hint")}
          </p>
        </div>
      ) : (
        <>
          {canBulkApprove && selectableItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-step-0 text-muted-foreground">
                  {t("automatic.selected", { count: selectedKeys.length })}
                </p>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => setDeselected(new Set())}
                  disabled={selectedKeys.length === selectableItems.length}
                >
                  {t("automatic.selectAll")}
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() =>
                    setDeselected(new Set(selectableItems.map((item) => item.key)))
                  }
                  disabled={selectedKeys.length === 0}
                >
                  {t("automatic.clearSelection")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="ml-auto"
                  onClick={handleCommit}
                  disabled={approving || selectedKeys.length === 0}
                >
                  {approving ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Plus />
                  )}
                  {approving
                    ? t("automatic.approving")
                    : t("automatic.approve", { count: selectedKeys.length })}
                </Button>
              </div>
              {/* Aviso temporário da Fase 3A. Remover quando a Fase 3B
                  (commit item a item para jobs manuais) for implementada. */}
              {hasManualSelected && (
                <p className="text-step-0 text-muted-foreground">
                  {t("review.manualBulkHint")}
                </p>
              )}
            </div>
          )}

          <div className="rounded-control border border-border">
            {items.map((item) => (
              <ReviewRow
                key={item.key}
                item={item}
                selected={!deselected.has(item.key)}
                selectable={
                  item.state === "pending" &&
                  Boolean(item.candidate || item.selected)
                }
                busy={rowBusy === item.key}
                onToggle={() => toggle(item.key)}
                onSelectCandidate={(candidate) =>
                  void handleSaveMatch(item, candidate)
                }
                onFindMatch={() => setMatchItem(item)}
                onDismiss={() => void handleState(item, "dismissed")}
                onRestore={() => void handleState(item, "pending")}
              />
            ))}
          </div>

          {query.hasNextPage && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
            >
              {query.isFetchingNextPage ? (
                <Loader2 className="animate-spin" />
              ) : null}
              {t("automatic.loadMore")}
            </Button>
          )}
        </>
      )}

      {matchItem && (
        <MatchDialog
          item={matchItem}
          saving={savingMatch}
          onClose={() => setMatchItem(null)}
          onSelect={(candidate) => void handleSaveMatch(matchItem, candidate)}
        />
      )}
    </div>
  );
}
