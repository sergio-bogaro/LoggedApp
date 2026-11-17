import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
  Settings2,
  Unplug,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";

import SuwayomiIntegration from "@/components/tw/settings/SuwayomiIntegration";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  deleteIntegration,
  listIntegrationStatuses,
  listIntegrations,
  pollIntegrationOAuth,
  saveIntegrationConfig,
  saveIntegrationStatuses,
  startIntegrationOAuth,
  syncIntegration,
  testIntegration,
} from "@/querries/librarySync";
import { suwayomiApi } from "@/querries/suwayomi";
import { useAppSelector } from "@/store/auth/hooks";
import type {
  OAuthStartResponse,
  SyncAction,
  SyncProviderInfo,
  SyncStatusOption,
} from "@/types/librarySync";

const ACTIONS: SyncAction[] = [
  "ignore",
  "backlog",
  "in_progress",
  "following",
  "on_hold",
  "finished",
  "dropped",
];

function formatDateTime(value?: string | null): string | null {
  if (!value) return null;
  const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function statusTone(status?: string | null): string {
  if (status === "ok") return "text-emerald-600 dark:text-emerald-400";
  if (status === "partial") return "text-amber-600 dark:text-amber-400";
  if (status === "failed") return "text-destructive";
  return "text-muted-foreground";
}

export function LibrarySyncIntegrations() {
  const { t } = useTranslation("librarySync");
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["integrations", user?.id],
    queryFn: () => listIntegrations(user!.id),
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [suwayomiOpen, setSuwayomiOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [updatesPerDay, setUpdatesPerDay] = useState("4");
  const [username, setUsername] = useState("");
  const [clientId, setClientId] = useState("");
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [savingStatuses, setSavingStatuses] = useState(false);
  const [device, setDevice] = useState<OAuthStartResponse | null>(null);
  const [statuses, setStatuses] = useState<SyncStatusOption[]>([]);

  const { data: suwayomiConfig, isLoading: suwayomiLoading } = useQuery({
    queryKey: ["suwayomi", "config", user?.id],
    queryFn: () => suwayomiApi.getConfig(user!.id),
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const current = useMemo(
    () => data?.find((item) => item.id === selected) ?? null,
    [data, selected]
  );

  const statusesQuery = useQuery({
    queryKey: ["integration-statuses", user?.id, selected],
    queryFn: () => listIntegrationStatuses(selected!, user!.id),
    enabled: !!user && !!selected,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!current) return;
    setEnabled(current.enabled);
    setUpdatesPerDay(String(current.updatesPerDay || 4));
    setUsername(current.username ?? "");
    setClientId(current.clientId ?? "");
    setToken("");
    setDevice(null);
  }, [current?.id]);  

  useEffect(() => {
    if (statusesQuery.data?.statuses) {
      setStatuses(statusesQuery.data.statuses);
    }
  }, [statusesQuery.data]);

  useEffect(() => {
    if (!device || !selected || !user) return;
    const interval = window.setInterval(async () => {
      try {
        const result = await pollIntegrationOAuth(selected, user.id);
        if (result.status === "connected") {
          window.clearInterval(interval);
          setDevice(null);
          toast.success(t("oauth.connected"));
          await queryClient.invalidateQueries({ queryKey: ["integrations"] });
          await queryClient.invalidateQueries({ queryKey: ["integration-statuses"] });
        } else if (result.status === "expired" || result.status === "error") {
          window.clearInterval(interval);
          setDevice(null);
          toast.error(result.error || t("oauth.expired"));
        }
      } catch (error) {
        window.clearInterval(interval);
        setDevice(null);
        toast.error(error instanceof Error ? error.message : t("errors.oauth"));
      }
    }, Math.max(device.interval || 5, 2) * 1000);
    return () => window.clearInterval(interval);
  }, [device, selected, user, queryClient, t]);

  const actionLabel = (action: SyncAction) =>
    t(`actions.${action}`, { defaultValue: action });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["integrations"] });
    await queryClient.invalidateQueries({ queryKey: ["integration-statuses"] });
  };

  const open = (provider: SyncProviderInfo) => {
    setSelected(provider.id);
    setStatuses([]);
  };

  const handleSave = async () => {
    if (!user || !selected || !current) return;
    setSaving(true);
    try {
      await saveIntegrationConfig(selected, {
        userId: user.id,
        enabled,
        updatesPerDay: Number(updatesPerDay) || 4,
        username:
          current.authKind === "username" ? username.trim() || null : undefined,
        clientId: clientId.trim() || undefined,
        token: current.authKind === "token" ? token.trim() || undefined : undefined,
      });
      toast.success(t("saved"));
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.save"));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!user || !selected) return;
    setTesting(true);
    try {
      const result = await testIntegration(selected, user.id);
      if (result.ok) {
        toast.success(t("testOk", { account: result.account || "" }));
        await refresh();
      } else {
        toast.error(result.error || t("errors.test"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.test"));
      await refresh();
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    if (!user || !selected) return;
    setSyncing(true);
    try {
      await syncIntegration(selected, user.id);
      toast.success(t("syncStarted"));
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.sync"));
      await refresh();
    } finally {
      setSyncing(false);
    }
  };

  const handleOAuth = async () => {
    if (!user || !selected) return;
    try {
      const result = await startIntegrationOAuth(selected, user.id);
      setDevice(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.oauth"));
    }
  };

  const handleSaveStatuses = async () => {
    if (!user || !selected) return;
    setSavingStatuses(true);
    try {
      await saveIntegrationStatuses(
        selected,
        user.id,
        statuses.map((item) => ({
          sourceStatus: item.sourceStatus,
          sourceLabel: item.sourceLabel,
          action: item.action,
        }))
      );
      toast.success(t("saved"));
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.save"));
    } finally {
      setSavingStatuses(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user || !selected) return;
    try {
      await deleteIntegration(selected, user.id);
      setSelected(null);
      toast.success(t("disconnected"));
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.delete"));
    }
  };

  const summary = current?.lastSyncSummary as Record<string, unknown> | null | undefined;
  const summaryNumber = (key: string) => Number(summary?.[key] ?? 0);

  return (
    <div className="space-y-4">
      <p className="text-step-1 text-muted-foreground">{t("description")}</p>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setSuwayomiOpen(true)}
            className="rounded-control border border-border bg-background p-3 text-left transition-colors hover:bg-accent/40"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-step-1 font-medium">
                  {t("title", { ns: "suwayomi" })}
                </p>
                <p className="truncate text-step-0 text-muted-foreground">
                  {suwayomiConfig?.configured
                    ? suwayomiConfig.baseUrl
                    : t("notConnected")}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-step-0",
                  suwayomiConfig?.configured
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {suwayomiConfig?.configured ? t("connected") : t("connect")}
              </span>
            </div>
            <p className="mt-2 text-step-0 text-muted-foreground">
              {suwayomiLoading
                ? t("neverSynced")
                : suwayomiConfig?.configured && suwayomiConfig.enabled
                  ? formatDateTime(suwayomiConfig.lastSyncAt)
                    ? t("lastSync", {
                      date: formatDateTime(suwayomiConfig.lastSyncAt),
                    })
                    : t("neverSynced")
                  : t("disabled")}
            </p>
          </button>

          {(data ?? []).map((provider) => {
            const last = formatDateTime(provider.lastSyncAt);
            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => open(provider)}
                className={cn(
                  "rounded-control border border-border bg-background p-3 text-left transition-colors hover:bg-accent/40",
                  selected === provider.id && "border-primary/40 bg-accent/30"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-step-1 font-medium">
                      {t(`providers.${provider.id}.label`, {
                        defaultValue: provider.label,
                      })}
                    </p>
                    <p className="truncate text-step-0 text-muted-foreground">
                      {provider.connected
                        ? provider.account ||
                          t(`providers.${provider.id}.connected`, {
                            defaultValue: t("connected"),
                          })
                        : t("notConnected")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-step-0",
                      provider.connected
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {provider.connected ? t("connected") : t("connect")}
                  </span>
                </div>
                <p className="mt-2 text-step-0 text-muted-foreground">
                  {provider.enabled && provider.connected
                    ? last
                      ? t("lastSync", { date: last })
                      : t("neverSynced")
                    : t("disabled")}
                </p>
                {provider.needsReauth && (
                  <p className="mt-1 text-step-0 text-destructive">
                    {t("needsReauth")}
                  </p>
                )}
                {provider.pendingReview > 0 && (
                  <p className="mt-1 text-step-0 text-amber-600 dark:text-amber-400">
                    {t("summary.pendingReview", { count: provider.pendingReview })}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(next) => {
          if (!next) {
            setSelected(null);
            setDevice(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] w-[95%] max-w-2xl overflow-y-auto">
          {current && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t(`providers.${current.id}.label`, {
                    defaultValue: current.label,
                  })}
                </DialogTitle>
                <DialogDescription>
                  {t(`providers.${current.id}.description`, {
                    defaultValue: t("description"),
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {current.authKind === "username" && (
                  <div className="space-y-1.5">
                    <label className="text-step-1" htmlFor="sync-username">
                      {t("username")}
                    </label>
                    <Input
                      id="sync-username"
                      name="sync-username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      autoComplete="off"
                    />
                  </div>
                )}

                {current.id === "mal" && (
                  <div className="space-y-1.5">
                    <label className="text-step-1" htmlFor="sync-client-id">
                      {t("clientId")}
                    </label>
                    <Input
                      id="sync-client-id"
                      name="sync-client-id"
                      value={clientId}
                      onChange={(event) => setClientId(event.target.value)}
                      placeholder={t("clientIdPlaceholder")}
                      autoComplete="off"
                    />
                    <p className="text-step-0 text-muted-foreground">
                      {t("clientIdHint")}
                    </p>
                  </div>
                )}

                {current.authKind === "token" && (
                  <div className="space-y-1.5">
                    <label className="text-step-1" htmlFor="sync-token">
                      {t("token")}
                    </label>
                    <Input
                      id="sync-token"
                      name="sync-token"
                      type="password"
                      value={token}
                      onChange={(event) => setToken(event.target.value)}
                      placeholder={
                        current.hasToken ? t("tokenKeep") : t("tokenPlaceholder")
                      }
                      autoComplete="off"
                    />
                  </div>
                )}

                {current.authKind === "oauth" && (
                  <div className="space-y-2 rounded-control border border-border p-3">
                    <p className="text-step-1">
                      {current.connected
                        ? t("oauth.connectedAs", {
                          account: current.account || current.label,
                        })
                        : t("oauth.notConnected")}
                    </p>
                    {current.needsReauth && (
                      <p className="text-step-0 text-destructive">
                        {t("needsReauth")}
                      </p>
                    )}
                    <Button type="button" size="sm" onClick={handleOAuth}>
                      <RefreshCw />
                      {current.connected ? t("oauth.reconnect") : t("oauth.connect")}
                    </Button>
                    {device && (
                      <div className="space-y-1 rounded-control bg-muted/50 p-2">
                        <p className="text-step-0 text-muted-foreground">
                          {t("oauth.instructions")}
                        </p>
                        <p className="font-mono text-step-2 font-medium">
                          {device.userCode}
                        </p>
                        {device.verificationUrl && (
                          <a
                            href={device.verificationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-step-1 text-primary underline-offset-4 hover:underline"
                          >
                            {device.verificationUrl}
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                        <p className="text-step-0 text-muted-foreground">
                          {t("oauth.waiting")}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-2">
                    <Switch checked={enabled} onCheckedChange={setEnabled} />
                    <span className="text-step-1">{t("enabled")}</span>
                  </label>
                  <div className="space-y-1">
                    <label className="text-step-1" htmlFor="sync-frequency">
                      {t("frequency")}
                    </label>
                    <SelectBase
                      value={updatesPerDay}
                      onValueChange={setUpdatesPerDay}
                    >
                      <SelectTrigger id="sync-frequency" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 4, 6, 8, 12, 24].map((value) => (
                          <SelectItem key={value} value={String(value)}>
                            {t("frequencyValue", { count: value })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectBase>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin" /> : <Check />}
                    {t("save")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTest}
                    disabled={testing || !current.connected}
                  >
                    {testing ? <Loader2 className="animate-spin" /> : <Settings2 />}
                    {t("test")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSync}
                    disabled={syncing || !current.connected}
                  >
                    {syncing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                    {t("syncNow")}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link
                      to={`/import?provider=${current.id}${
                        current.username
                          ? `&username=${encodeURIComponent(current.username)}`
                          : ""
                      }`}
                    >
                      <Upload />
                      {t("importLibrary")}
                    </Link>
                  </Button>
                  {current.connected && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleDisconnect}
                    >
                      <Unplug />
                      {t("disconnect")}
                    </Button>
                  )}
                </div>

                <div className="space-y-2 border-t border-border pt-3">
                  <p className="text-step-1 font-medium">{t("mappings.title")}</p>
                  <p className="text-step-0 text-muted-foreground">
                    {t("mappings.description")}
                  </p>
                  {statusesQuery.isLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        {statuses.map((status, index) => (
                          <div
                            key={status.sourceStatus}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-border px-2 py-1.5"
                          >
                            <span className="text-step-1">
                              {t(
                                `providers.${current.id}.statuses.${status.sourceStatus}`,
                                { defaultValue: status.sourceLabel }
                              )}
                            </span>
                            <SelectBase
                              value={status.action}
                              onValueChange={(value) =>
                                setStatuses((rows) =>
                                  rows.map((row, rowIndex) =>
                                    rowIndex === index
                                      ? { ...row, action: value as SyncAction }
                                      : row
                                  )
                                )
                              }
                            >
                              <SelectTrigger size="sm" className="w-44">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ACTIONS.map((action) => (
                                  <SelectItem key={action} value={action}>
                                    {actionLabel(action)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </SelectBase>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleSaveStatuses}
                        disabled={savingStatuses || statuses.length === 0}
                      >
                        {savingStatuses ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Check />
                        )}
                        {t("mappings.save")}
                      </Button>
                    </>
                  )}
                </div>

                {summary && (
                  <div className="space-y-2 border-t border-border pt-3">
                    <p className="text-step-1 font-medium">{t("summary.title")}</p>
                    <p className={cn("text-step-0", statusTone(current.lastSyncStatus))}>
                      {current.lastSyncStatus
                        ? t(`status.${current.lastSyncStatus}`, {
                          defaultValue: current.lastSyncStatus,
                        })
                        : t("neverSynced")}
                      {current.lastSyncAt
                        ? ` · ${formatDateTime(current.lastSyncAt)}`
                        : ""}
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        ["created", "summary.created"],
                        ["statusUpdated", "summary.statusUpdated"],
                        ["backlogAdded", "summary.backlogAdded"],
                        ["logsCreated", "summary.logsCreated"],
                        ["pending", "summary.pending"],
                        ["missing", "summary.missing"],
                        ["unmatched", "summary.unmatched"],
                        ["removed", "summary.removed"],
                      ].map(([key, label]) => (
                        <div
                          key={key}
                          className="rounded-control border border-border px-2 py-1.5"
                        >
                          <p className="font-serif text-step-2 tabular-nums">
                            {summaryNumber(key)}
                          </p>
                          <p className="text-step-0 text-muted-foreground">
                            {t(label)}
                          </p>
                        </div>
                      ))}
                    </div>
                    {summaryNumber("missing") > 0 && (
                      <p className="text-step-0 text-muted-foreground">
                        {current.pendingReview > 0
                          ? t("summary.reviewHint")
                          : t("summary.missingHint")}
                      </p>
                    )}
                    {current.pendingReview > 0 && (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-border p-2">
                        <p className="text-step-0">
                          {t("summary.pendingReview", {
                            count: current.pendingReview,
                          })}
                        </p>
                        <Button type="button" size="xs" variant="outline" asChild>
                          <Link to={`/import?tab=auto&provider=${current.id}`}>
                            <Check />
                            {t("summary.review")}
                          </Link>
                        </Button>
                      </div>
                    )}
                    {Array.isArray(summary.errors) && summary.errors.length > 0 && (
                      <p className="text-step-0 text-destructive">
                        {t("summary.errors", { count: summary.errors.length })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={suwayomiOpen} onOpenChange={setSuwayomiOpen}>
        <DialogContent className="max-h-[90vh] w-[95%] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("title", { ns: "suwayomi" })}</DialogTitle>
            <DialogDescription>
              {t("description", { ns: "suwayomi" })}
            </DialogDescription>
          </DialogHeader>
          <SuwayomiIntegration />
        </DialogContent>
      </Dialog>
    </div>
  );
}
