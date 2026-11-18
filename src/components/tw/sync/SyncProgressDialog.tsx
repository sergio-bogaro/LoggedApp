import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { SyncRun, SyncRunProvider } from "@/types/librarySync";

function providerLabel(
  providerId: string,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  if (providerId === "suwayomi") {
    return t("title", { ns: "suwayomi" });
  }
  return t(`providers.${providerId}.label`, {
    ns: "librarySync",
    defaultValue: providerId,
  });
}

function ProviderRow({
  provider,
  t,
}: {
  provider: SyncRunProvider;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const Icon =
    provider.status === "running"
      ? Loader2
      : provider.status === "done"
        ? CheckCircle2
        : provider.status === "error"
          ? AlertCircle
          : Circle;

  return (
    <div className="flex items-center gap-2 text-step-0">
      <Icon
        className={cn(
          "size-3.5 shrink-0",
          provider.status === "running" && "animate-spin text-primary",
          provider.status === "done" && "text-emerald-600 dark:text-emerald-400",
          provider.status === "error" && "text-destructive",
          provider.status === "pending" && "text-muted-foreground"
        )}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate">
        {providerLabel(provider.id, t)}
      </span>
      {provider.total > 0 && (
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {provider.done}/{provider.total}
        </span>
      )}
    </div>
  );
}

function runTitle(
  run: SyncRun,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  if (run.scope === "all") return t("syncRun.titleAll");
  if (run.scope === "suwayomi") return t("syncRun.titleSuwayomi");
  return t("syncRun.titleProvider", {
    provider: providerLabel(run.scope, t),
  });
}

export function SyncProgressDialog({
  open,
  run,
  onClose,
}: {
  open: boolean;
  run: SyncRun | null;
  onClose: () => void;
}) {
  const { t } = useTranslation(["librarySync", "suwayomi"]);

  if (!run) return null;

  const summary = run.summary as Record<string, unknown> | null | undefined;
  const summaryNumber = (key: string) => Number(summary?.[key] ?? 0);
  const running = run.status === "running";
  const percent = run.percent ?? null;
  const statusLabel = running
    ? run.label || t("syncRun.preparing")
    : run.status === "success"
      ? t("syncRun.success")
      : run.status === "partial"
        ? t("syncRun.partial")
        : t("syncRun.failed");

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="pr-8">{runTitle(run, t)}</DialogTitle>
          <DialogDescription>{statusLabel}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-step-0">
              <span className="min-w-0 truncate text-muted-foreground">
                {running
                  ? run.label || t("syncRun.preparing")
                  : statusLabel}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {percent !== null ? `${Math.round(percent)}%` : t("syncRun.working")}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full bg-primary transition-[width] duration-300",
                  percent === null && "w-1/4 animate-pulse"
                )}
                style={percent !== null ? { width: `${percent}%` } : undefined}
              />
            </div>
            {run.total > 0 && (
              <p className="text-step-0 tabular-nums text-muted-foreground">
                {t("syncRun.items", { done: run.done, total: run.total })}
              </p>
            )}
          </div>

          {run.providers.length > 0 && (
            <div className="space-y-1.5 rounded-control border border-border p-3">
              <p className="text-step-0 font-medium text-muted-foreground">
                {t("syncRun.providers")}
              </p>
              {run.providers.map((provider) => (
                <ProviderRow key={provider.id} provider={provider} t={t} />
              ))}
            </div>
          )}

          {run.error && (
            <p className="rounded-control border border-destructive/40 bg-destructive/5 p-3 text-step-0 text-destructive">
              {run.error}
            </p>
          )}

          {!running && summary && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["created", t("syncRun.created")],
                ["statusUpdated", t("syncRun.updated")],
                ["backlogAdded", t("syncRun.backlog")],
                ["logsCreated", t("syncRun.logs")],
                ["reviewStaged", t("syncRun.review")],
                ["missing", t("syncRun.missing")],
              ].map(([key, label]) => {
                const value = summaryNumber(key);
                if (!value) return null;
                return (
                  <div
                    key={key}
                    className="rounded-control border border-border px-3 py-2"
                  >
                    <p className="font-serif text-step-3 tabular-nums">{value}</p>
                    <p className="text-step-0 text-muted-foreground">{label}</p>
                  </div>
                );
              })}
              {Number(summary.ok) > 0 && (
                <div className="rounded-control border border-border px-3 py-2">
                  <p className="font-serif text-step-3 tabular-nums">
                    {summaryNumber("ok")}
                  </p>
                  <p className="text-step-0 text-muted-foreground">
                    {t("syncRun.okProviders")}
                  </p>
                </div>
              )}
              {Number(summary.failed) > 0 && (
                <div className="rounded-control border border-border px-3 py-2">
                  <p className="font-serif text-step-3 tabular-nums">
                    {summaryNumber("failed")}
                  </p>
                  <p className="text-step-0 text-muted-foreground">
                    {t("syncRun.failedProviders")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {running ? (
            <Button type="button" variant="outline" onClick={onClose}>
              {t("syncRun.background")}
            </Button>
          ) : (
            <Button type="button" onClick={onClose}>
              {t("syncRun.close")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
