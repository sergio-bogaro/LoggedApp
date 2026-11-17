import { useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink,
  ImageOff,
  Loader2,
  Plus,
  RotateCcw,
  SkipForward,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSyncSuggestions } from "@/hooks/useSyncSuggestions";
import { cn } from "@/lib/utils";
import {
  approveSyncSuggestions,
  updateSyncSuggestion,
} from "@/querries/librarySync";
import { useAppSelector } from "@/store/auth/hooks";
import type { SyncSuggestion, SyncSuggestionState } from "@/types/librarySync";
import { metadataUrl } from "@/utils/importLinks";

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

function SuggestionRow({
  suggestion,
  selected,
  busy,
  onToggle,
  onDismiss,
  onRestore,
}: {
  suggestion: SyncSuggestion;
  selected: boolean;
  busy: boolean;
  onToggle: () => void;
  onDismiss: () => void;
  onRestore: () => void;
}) {
  const { t } = useTranslation(["import", "librarySync", "media"]);
  const pending = suggestion.reviewState === "pending";
  const cover = suggestion.candidate?.coverUrl;
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
  const sourceLabel = t(
    `providers.${suggestion.provider}.statuses.${suggestion.sourceStatus}`,
    {
      ns: "librarySync",
      defaultValue: suggestion.sourceLabel || suggestion.sourceStatus,
    }
  );

  return (
    <div
      className={cn(
        "flex gap-3 border-b border-border p-3 last:border-b-0",
        !pending && "opacity-60"
      )}
    >
      {pending ? (
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
      </div>

      <div className="shrink-0">
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
      </div>
    </div>
  );
}

export function AutomaticImports({ provider }: { provider?: string }) {
  const { t } = useTranslation(["import", "librarySync", "media"]);
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const [state, setState] = useState<SyncSuggestionState>("pending");
  const [deselected, setDeselected] = useState<Set<number>>(new Set());
  const [approving, setApproving] = useState(false);
  const [rowBusy, setRowBusy] = useState<number | null>(null);

  const { data, isLoading } = useSyncSuggestions(user?.id, state, provider);
  const items = data?.items ?? [];
  const counts = data?.counts;
  const pendingItems = useMemo(
    () => items.filter((item) => item.reviewState === "pending"),
    [items]
  );
  const selectedIds = useMemo(
    () =>
      pendingItems
        .filter((item) => !deselected.has(item.id))
        .map((item) => item.id),
    [pendingItems, deselected]
  );

  useEffect(() => {
    setDeselected(new Set());
  }, [state, provider]);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["sync-suggestions"] }),
      queryClient.invalidateQueries({ queryKey: ["integrations"] }),
      queryClient.invalidateQueries({ queryKey: ["media"] }),
      queryClient.invalidateQueries({ queryKey: ["existingMedia"] }),
      queryClient.invalidateQueries({ queryKey: ["media-logs"] }),
      queryClient.invalidateQueries({ queryKey: ["backlog"] }),
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-step-1">{t("automatic.title")}</p>
          <p className="text-step-0 text-muted-foreground">
            {t("automatic.description")}
          </p>
        </div>

        <div className="flex rounded-control border border-border p-0.5">
          {(["pending", "dismissed"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={state === value}
              onClick={() => setState(value)}
              className={cn(
                "rounded-[calc(var(--radius-control)-2px)] px-2 py-1 text-step-0",
                state === value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(value === "pending" ? "automatic.tabPending" : "automatic.tabDismissed")}
              {value === "pending" && counts?.pending
                ? ` (${counts.pending})`
                : ""}
              {value === "dismissed" && counts?.dismissed
                ? ` (${counts.dismissed})`
                : ""}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : items.length === 0 ? (
        <div className="rounded-control border border-dashed border-border p-6 text-center">
          <p className="text-step-1 font-medium">
            {t(
              state === "pending"
                ? "automatic.emptyPending"
                : "automatic.emptyDismissed"
            )}
          </p>
          <p className="mt-1 text-step-0 text-muted-foreground">
            {t("automatic.emptyHint")}
          </p>
        </div>
      ) : (
        <>
          {state === "pending" && (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-step-0 text-muted-foreground">
                {t("automatic.selected", { count: selectedIds.length })}
              </p>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => setDeselected(new Set())}
                disabled={selectedIds.length === pendingItems.length}
              >
                {t("automatic.selectAll")}
              </Button>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() =>
                  setDeselected(new Set(pendingItems.map((item) => item.id)))
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
            {items.map((suggestion) => (
              <SuggestionRow
                key={suggestion.id}
                suggestion={suggestion}
                selected={!deselected.has(suggestion.id)}
                busy={rowBusy === suggestion.id}
                onToggle={() => toggle(suggestion.id)}
                onDismiss={() => void handleState(suggestion, "dismissed")}
                onRestore={() => void handleState(suggestion, "pending")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
