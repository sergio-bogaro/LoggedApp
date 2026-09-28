import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  authApi,
  integrationsApi,
  type IntegrationEntry,
  type UserSecrets,
} from "@/querries/auth/auth";
import { useAppSelector } from "@/store/auth/hooks";

function IntegrationKeysForm() {
  const { t } = useTranslation("common");
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const [tmdbApiKey, setTmdbApiKey] = useState("");
  const [igdbClientId, setIgdbClientId] = useState("");
  const [igdbClientSecret, setIgdbClientSecret] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: status } = useQuery({
    queryKey: ["integrations", "status", user?.id],
    queryFn: () => integrationsApi.getStatus(user!.id),
    enabled: !!user,
  });

  const statusLabel = (entry?: IntegrationEntry) => {
    if (!entry || entry.source === "none") {
      return t("settings.integrations.status.none");
    }
    return entry.source === "user"
      ? t("settings.integrations.status.user")
      : t("settings.integrations.status.instance");
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["integrations", "status"] });
    queryClient.invalidateQueries({ queryKey: ["tmdb", "config"] });
    queryClient.invalidateQueries({ queryKey: ["igdb", "config"] });
  };

  const save = async (payload: UserSecrets) => {
    if (!user) return;
    setIsSaving(true);

    try {
      await authApi.updateUser(user.id, payload);
      setTmdbApiKey("");
      setIgdbClientId("");
      setIgdbClientSecret("");
      refresh();
      toast.success(t("settings.integrations.saved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errorLoading"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    const payload: UserSecrets = {};

    if (tmdbApiKey.trim()) payload.tmdbApiKey = tmdbApiKey.trim();

    const hasClientId = igdbClientId.trim().length > 0;
    const hasClientSecret = igdbClientSecret.trim().length > 0;
    if (hasClientId !== hasClientSecret) {
      toast.error(t("settings.integrations.requireBothIgdb"));
      return;
    }
    if (hasClientId && hasClientSecret) {
      payload.igdbClientId = igdbClientId.trim();
      payload.igdbClientSecret = igdbClientSecret.trim();
    }

    if (Object.keys(payload).length === 0) {
      toast.error(t("settings.integrations.nothingToSave"));
      return;
    }

    void save(payload);
  };

  const handleClear = (payload: UserSecrets) => {
    void save(payload);
  };

  return (
    <div className="max-w-md space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-step-1">{t("settings.integrations.tmdb.label")}</p>
          <span className="text-step-0 text-muted-foreground">
            {statusLabel(status?.tmdb)}
          </span>
        </div>
        <Input
          name="tmdbApiKey"
          type="password"
          autoComplete="off"
          placeholder={t("settings.integrations.tmdb.placeholder")}
          value={tmdbApiKey}
          onChange={(event) => setTmdbApiKey(event.target.value)}
        />
        {status?.tmdb.source === "user" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={() => handleClear({ tmdbApiKey: "" })}
          >
            {t("settings.integrations.clear")}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-step-1">{t("settings.integrations.igdb.label")}</p>
          <span className="text-step-0 text-muted-foreground">
            {statusLabel(status?.igdb)}
          </span>
        </div>
        <Input
          name="igdbClientId"
          autoComplete="off"
          placeholder={t("settings.integrations.igdb.clientIdPlaceholder")}
          value={igdbClientId}
          onChange={(event) => setIgdbClientId(event.target.value)}
        />
        <Input
          name="igdbClientSecret"
          type="password"
          autoComplete="off"
          placeholder={t("settings.integrations.igdb.clientSecretPlaceholder")}
          value={igdbClientSecret}
          onChange={(event) => setIgdbClientSecret(event.target.value)}
        />
        {status?.igdb.source === "user" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={() => handleClear({ igdbClientId: "", igdbClientSecret: "" })}
          >
            {t("settings.integrations.clear")}
          </Button>
        )}
      </div>

      <Button type="button" onClick={handleSave} disabled={isSaving}>
        {t("save")}
      </Button>
    </div>
  );
}

export default IntegrationKeysForm;
