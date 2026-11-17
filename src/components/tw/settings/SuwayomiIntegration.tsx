import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { suwayomiApi } from "@/querries/suwayomi";
import { useAppSelector } from "@/store/auth/hooks";
import type {
  SuwayomiAction,
  SuwayomiCategory,
  SuwayomiConfigPayload,
  SuwayomiSyncSummary,
} from "@/types/suwayomi";

const noAutofillProps = {
  autoComplete: "off",
  spellCheck: false,
  autoCorrect: "off",
  autoCapitalize: "off",
  "data-1p-ignore": "true",
  "data-lpignore": "true",
  "data-bwignore": "true",
  "data-form-type": "other",
} as const;

const STATUS_ACTIONS: SuwayomiAction[] = [
  "in_progress",
  "following",
  "on_hold",
  "finished",
  "dropped",
];

function formatDateTime(value?: string | null, language?: string): string | null {
  if (!value) return null;
  // O backend grava datas ingênuas em UTC; sem o sufixo o navegador as leria
  // como horário local.
  const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(language);
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-control border border-border px-3 py-2">
      <p className="font-serif text-step-3 tabular-nums">{value}</p>
      <p className="text-step-0 text-muted-foreground">{label}</p>
    </div>
  );
}

function SummaryList({
  title,
  items,
  hint,
}: {
  title: string;
  items: string[];
  hint?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-step-0 font-medium">{title}</p>
      <ul className="list-disc space-y-0.5 pl-5 text-step-0 text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="break-words">
            {item}
          </li>
        ))}
      </ul>
      {hint && <p className="text-step-0 text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SuwayomiIntegration() {
  const { t, i18n } = useTranslation(["suwayomi", "media"]);
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["suwayomi", "config", user?.id],
    queryFn: () => suwayomiApi.getConfig(user!.id),
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["suwayomi", "categories", user?.id, config?.baseUrl],
    queryFn: () => suwayomiApi.getCategories(user!.id),
    enabled: !!user && !!config?.configured,
    refetchOnWindowFocus: false,
  });

  const [baseUrl, setBaseUrl] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [updatesPerDay, setUpdatesPerDay] = useState("4");
  const [authOpen, setAuthOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [actions, setActions] = useState<Record<number, SuwayomiAction>>({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [savingAuth, setSavingAuth] = useState(false);
  const [savingCategories, setSavingCategories] = useState(false);
  const [initializedFor, setInitializedFor] = useState<number | null>(null);

  useEffect(() => {
    if (!config || !user) return;
    if (initializedFor === user.id) return;
    setBaseUrl(config.baseUrl ?? "");
    setEnabled(config.enabled);
    setUpdatesPerDay(String(config.updatesPerDay ?? 4));
    setUsername(config.username ?? "");
    setInitializedFor(user.id);
  }, [config, user, initializedFor]);

  useEffect(() => {
    if (!categoriesData) return;
    setActions(
      Object.fromEntries(
        categoriesData.categories.map((category) => [category.id, category.action])
      ) as Record<number, SuwayomiAction>
    );
  }, [categoriesData]);

  const configured = config?.configured ?? false;
  const summary: SuwayomiSyncSummary | null = config?.lastSyncSummary ?? null;
  const language = i18n.resolvedLanguage ?? i18n.language;

  const hours = useMemo(() => {
    const perDay = Number(updatesPerDay) || 1;
    return (24 / Math.min(Math.max(perDay, 1), 24)).toFixed(1);
  }, [updatesPerDay]);

  const actionOptions = useMemo(
    () => [
      { value: "ignore" as SuwayomiAction, label: t("actions.ignore") },
      { value: "backlog" as SuwayomiAction, label: t("actions.backlog") },
      ...STATUS_ACTIONS.map((action) => ({
        value: action,
        label: t(`status.${action}`, { ns: "media" }),
      })),
    ],
    [t]
  );

  const actionLabel = (value?: string | null) => {
    if (!value) return "—";
    if (value === "ignore") return t("actions.ignore");
    if (value === "backlog") return t("actions.backlog");
    return t(`status.${value}`, { ns: "media", defaultValue: value });
  };

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["suwayomi", "config"] }),
      queryClient.invalidateQueries({ queryKey: ["suwayomi", "categories"] }),
    ]);
  };

  const refreshLibrary = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["media"] }),
      queryClient.invalidateQueries({ queryKey: ["existingMedia"] }),
      queryClient.invalidateQueries({ queryKey: ["media-logs"] }),
      queryClient.invalidateQueries({ queryKey: ["backlog"] }),
    ]);
  };

  const persistConfig = async (
    extra?: Pick<SuwayomiConfigPayload, "username" | "password" | "clearAuth">
  ): Promise<boolean> => {
    if (!user) return false;

    const url = baseUrl.trim();
    if (!url) {
      toast.error(t("errors.urlRequired"));
      return false;
    }
    const perDay = Number(updatesPerDay);
    if (!Number.isInteger(perDay) || perDay < 1 || perDay > 24) {
      toast.error(t("errors.invalidTimes"));
      return false;
    }

    setSaving(true);
    try {
      await suwayomiApi.saveConfig({
        userId: user.id,
        baseUrl: url,
        enabled,
        updatesPerDay: perDay,
        ...extra,
      });
      await refresh();
      toast.success(t("connection.saved"));
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.save"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!user) return;
    const url = baseUrl.trim();
    if (!url) {
      toast.error(t("errors.urlRequired"));
      return;
    }
    if (authOpen && (!username.trim() || !password)) {
      toast.error(t("auth.required"));
      return;
    }

    setTesting(true);
    try {
      const result = await suwayomiApi.testConnection({
        userId: user.id,
        baseUrl: url,
        ...(authOpen ? { username: username.trim(), password } : {}),
      });
      if (result.ok) {
        toast.success(
          t("connection.success", {
            name: result.serverName ?? "Suwayomi",
            version: result.version ?? "",
          })
        );
      } else {
        toast.error(result.error || t("errors.test"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.test"));
    } finally {
      setTesting(false);
    }
  };

  const handleSaveAuth = async () => {
    if (!username.trim() || !password) {
      toast.error(t("auth.required"));
      return;
    }
    setSavingAuth(true);
    const ok = await persistConfig({
      username: username.trim(),
      password,
    });
    setSavingAuth(false);
    if (ok) {
      setPassword("");
      setAuthOpen(false);
    }
  };

  const handleClearAuth = async () => {
    setSavingAuth(true);
    const ok = await persistConfig({ clearAuth: true });
    setSavingAuth(false);
    if (ok) {
      setUsername("");
      setPassword("");
      setAuthOpen(false);
    }
  };

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const result = await suwayomiApi.syncNow(user.id);
      await refresh();
      await refreshLibrary();
      if (result.status === "error") {
        const message = result.summary.errors?.[0] || t("errors.sync");
        toast.error(message);
      } else {
        toast.success(
          t("connection.syncDone", {
            created: result.summary.created ?? 0,
          })
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.sync"));
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveCategories = async () => {
    if (!user || !categoriesData) return;
    setSavingCategories(true);
    try {
      await suwayomiApi.saveCategories(
        user.id,
        categoriesData.categories.map((category) => ({
          categoryId: category.id,
          categoryName: category.name,
          action: actions[category.id] ?? category.action,
          categoryOrder: category.order,
        }))
      );
      await refresh();
      toast.success(t("categories.saved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.save"));
    } finally {
      setSavingCategories(false);
    }
  };

  const setCategoryAction = (category: SuwayomiCategory, action: SuwayomiAction) => {
    setActions((prev) => ({ ...prev, [category.id]: action }));
  };

  if (isLoading) {
    return <Skeleton className="h-40 w-full max-w-2xl" />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-step-1" htmlFor="suwayomi-url">
            {t("connection.url")}
          </label>
          <Input
            id="suwayomi-url"
            name="suwayomi-url"
            value={baseUrl}
            placeholder={t("connection.urlPlaceholder")}
            onChange={(event) => setBaseUrl(event.target.value)}
            {...noAutofillProps}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleTest}
            disabled={testing || saving}
          >
            {testing && <Loader2 className="animate-spin" />}
            {testing ? t("connection.testing") : t("connection.test")}
          </Button>
          <Button type="button" size="sm" onClick={() => void persistConfig()} disabled={saving}>
            {saving ? t("connection.saving") : t("connection.save")}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={setEnabled} />
            <span className="text-step-1">{t("connection.enabled")}</span>
          </label>

          <label className="flex items-center gap-2">
            <span className="text-step-1">{t("connection.timesPerDay")}</span>
            <Input
              type="number"
              min={1}
              max={24}
              name="suwayomi-updates-per-day"
              value={updatesPerDay}
              onChange={(event) => setUpdatesPerDay(event.target.value)}
              className="w-20"
            />
          </label>
        </div>
        <p className="text-step-0 text-muted-foreground">
          {t("connection.timesHint", { hours })}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-step-0 text-muted-foreground">
          <span>
            {t("connection.lastSync")}:{" "}
            {formatDateTime(config?.lastSyncAt, language) ?? t("connection.never")}
          </span>
          {config?.enabled && (
            <span>
              {t("connection.nextSync")}:{" "}
              {formatDateTime(config?.nextSyncAt, language) ?? t("connection.never")}
            </span>
          )}
          {config?.lastSyncStatus && (
            <span>
              {t(`syncStatus.${config.lastSyncStatus}`, {
                defaultValue: config.lastSyncStatus,
              })}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={!configured || syncing}
          >
            {syncing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            {syncing ? t("connection.syncing") : t("connection.syncNow")}
          </Button>
          <Button asChild type="button" size="sm" variant="outline">
            <Link to="/import">{t("connection.importLibrary")}</Link>
          </Button>
        </div>
        <p className="text-step-0 text-muted-foreground">{t("connection.importHint")}</p>
      </div>

      <div className="space-y-2 rounded-control border border-border p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-step-1">{t("auth.label")}</p>
          <span className="text-step-0 text-muted-foreground">
            {config?.hasPassword ? t("auth.configured") : t("auth.notConfigured")}
          </span>
        </div>

        {authOpen ? (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                {...noAutofillProps}
                name="suwayomi-username"
                placeholder={t("auth.username")}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
              <Input
                {...noAutofillProps}
                name="suwayomi-password"
                type="password"
                placeholder={t("auth.password")}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleSaveAuth}
                disabled={savingAuth}
              >
                {savingAuth ? t("connection.saving") : t("auth.save")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setPassword("");
                  setAuthOpen(false);
                }}
                disabled={savingAuth}
              >
                {t("connection.cancel")}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAuthOpen(true)}
            >
              {t("auth.edit")}
            </Button>
            {config?.hasPassword && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClearAuth}
                disabled={savingAuth}
              >
                {t("auth.clear")}
              </Button>
            )}
          </div>
        )}
        <p className="text-step-0 text-muted-foreground">{t("auth.hint")}</p>
      </div>

      {summary && (
        <div className="space-y-3 rounded-control border border-border p-3">
          <p className="font-medium text-step-1">{t("summary.title")}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <SummaryStat label={t("summary.stats.created")} value={summary.created ?? 0} />
            <SummaryStat
              label={t("summary.stats.statusUpdated")}
              value={summary.statusUpdated ?? 0}
            />
            <SummaryStat
              label={t("summary.stats.backlogAdded")}
              value={summary.backlogAdded ?? 0}
            />
            <SummaryStat
              label={t("summary.stats.backlogRemoved")}
              value={summary.backlogRemoved ?? 0}
            />
            <SummaryStat
              label={t("summary.stats.logsCreated")}
              value={summary.logsCreated ?? 0}
            />
            <SummaryStat
              label={t("summary.stats.datedItems")}
              value={summary.datedItems ?? 0}
            />
          </div>

          {summary.changes && summary.changes.length > 0 && (
            <div className="space-y-1">
              <p className="text-step-0 font-medium">{t("summary.changesTitle")}</p>
              <ul className="space-y-0.5 text-step-0 text-muted-foreground">
                {summary.changes.slice(0, 10).map((change, index) => (
                  <li key={`${change.suwayomiId}-${index}`} className="break-words">
                    {change.title}: {actionLabel(change.from)} → {actionLabel(change.to)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <SummaryList
            title={t("summary.unmatchedTitle", {
              count: summary.unmatched?.length ?? 0,
            })}
            items={(summary.unmatched ?? []).map((item) => item.title)}
            hint={t("summary.unmatchedHint")}
          />
          <SummaryList
            title={t("summary.pendingResolvedTitle", {
              count: summary.pendingResolved?.length ?? 0,
            })}
            items={summary.pendingResolved ?? []}
          />
          <SummaryList
            title={t("summary.removedTitle", { count: summary.removed?.length ?? 0 })}
            items={summary.removed ?? []}
          />
          <SummaryList
            title={t("summary.errorsTitle")}
            items={summary.errors ?? []}
          />
          {summary.error && (
            <p className="text-step-0 text-destructive">{summary.error}</p>
          )}
        </div>
      )}

      {configured && (
        <div className="space-y-3">
          <div>
            <p className="font-medium text-step-1">{t("categories.title")}</p>
            <p className="text-step-0 text-muted-foreground">
              {t("categories.description")}
            </p>
          </div>

          {categoriesData?.stale && (
            <p className="text-step-0 text-destructive">
              {categoriesData.error || t("categories.stale")}
            </p>
          )}

          {categoriesLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : categoriesData && categoriesData.categories.length > 0 ? (
            <>
              <div className="rounded-control border border-border px-3">
                {categoriesData.categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex flex-wrap items-center gap-3 border-b border-border py-2 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-step-1 font-medium">{category.name}</p>
                      <p className="text-step-0 text-muted-foreground">
                        {category.mangaCount != null &&
                          t("categories.mangaCount", { count: category.mangaCount })}
                        {category.mangaCount != null && !category.mapped && " · "}
                        {!category.mapped && t("categories.suggestion")}
                      </p>
                    </div>

                    <SelectBase
                      value={actions[category.id] ?? category.action}
                      onValueChange={(value) =>
                        setCategoryAction(category, value as SuwayomiAction)
                      }
                    >
                      <SelectTrigger size="sm" className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {actionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                onClick={handleSaveCategories}
                disabled={savingCategories}
              >
                {savingCategories ? t("categories.saving") : t("categories.save")}
              </Button>
            </>
          ) : (
            <p className="text-step-0 text-muted-foreground">{t("categories.empty")}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default SuwayomiIntegration;
