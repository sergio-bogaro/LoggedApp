import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import IntegrationHelp from "@/components/tw/settings/IntegrationHelp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  authApi,
  integrationsApi,
  type IntegrationEntry,
  type UserSecrets,
} from "@/querries/auth/auth";
import { useAppSelector } from "@/store/auth/hooks";

// Evita que o navegador/gerenciadores de senha preencham ou sugiram valores
// nestes campos de chave.
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

function IntegrationKeysForm() {
  const { t } = useTranslation("common");
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const [tmdbApiKey, setTmdbApiKey] = useState("");
  const [igdbClientId, setIgdbClientId] = useState("");
  const [igdbClientSecret, setIgdbClientSecret] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // null = segue o padrão (aberto se não configurado, fechado se configurado)
  const [editing, setEditing] = useState<{ tmdb: boolean | null; igdb: boolean | null }>({
    tmdb: null,
    igdb: null,
  });

  const { data: status, refetch } = useQuery({
    queryKey: ["integrations", "status", user?.id],
    queryFn: () => integrationsApi.getStatus(user!.id),
    enabled: !!user,
  });

  const tmdbConfigured = status?.tmdb.configured ?? false;
  const igdbConfigured = status?.igdb.configured ?? false;

  // Enquanto o status não carrega, mantém fechado (evita "flash" dos campos).
  const tmdbEditing = editing.tmdb ?? (status ? !tmdbConfigured : false);
  const igdbEditing = editing.igdb ?? (status ? !igdbConfigured : false);

  const statusLabel = (entry?: IntegrationEntry) => {
    if (!entry || entry.source === "none") {
      return t("settings.integrations.status.none");
    }
    return entry.source === "user"
      ? t("settings.integrations.status.user")
      : t("settings.integrations.status.instance");
  };

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["integrations", "status"] }),
      queryClient.invalidateQueries({ queryKey: ["tmdb", "config"] }),
      queryClient.invalidateQueries({ queryKey: ["igdb", "config"] }),
    ]);
    await refetch();
  };

  const persist = async (payload: UserSecrets): Promise<boolean> => {
    if (!user) return false;

    setIsSaving(true);
    try {
      await authApi.updateUser(user.id, payload);
      await refresh();
      toast.success(t("settings.integrations.saved"));
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errorLoading"));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const saveTmdb = async () => {
    const value = tmdbApiKey.trim();
    if (!value) {
      toast.error(t("settings.integrations.nothingToSave"));
      return;
    }

    if (await persist({ tmdbApiKey: value })) {
      setTmdbApiKey("");
      setEditing((prev) => ({ ...prev, tmdb: false }));
    }
  };

  const saveIgdb = async () => {
    const clientId = igdbClientId.trim();
    const clientSecret = igdbClientSecret.trim();
    if (!clientId || !clientSecret) {
      toast.error(t("settings.integrations.requireBothIgdb"));
      return;
    }

    if (await persist({ igdbClientId: clientId, igdbClientSecret: clientSecret })) {
      setIgdbClientId("");
      setIgdbClientSecret("");
      setEditing((prev) => ({ ...prev, igdb: false }));
    }
  };

  const clearGroup = async (payload: UserSecrets, group: "tmdb" | "igdb") => {
    if (await persist(payload)) {
      setEditing((prev) => ({ ...prev, [group]: false }));
    }
  };

  return (
    <div className="max-w-md space-y-6">
      {/* TMDB */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <p className="font-medium text-step-1">{t("settings.integrations.tmdb.label")}</p>
            <IntegrationHelp api="tmdb" />
          </div>
          <span className="text-step-0 text-muted-foreground">
            {statusLabel(status?.tmdb)}
          </span>
        </div>

        {tmdbEditing ? (
          <>
            <Input
              {...noAutofillProps}
              name="tmdbApiKey"
              placeholder={t("settings.integrations.tmdb.placeholder")}
              value={tmdbApiKey}
              onChange={(event) => setTmdbApiKey(event.target.value)}
            />
            <p className="text-step-0 text-muted-foreground">
              {t("settings.integrations.tmdb.hint")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={saveTmdb} disabled={isSaving}>
                {t("save")}
              </Button>
              {tmdbConfigured && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => {
                    setTmdbApiKey("");
                    setEditing((prev) => ({ ...prev, tmdb: false }));
                  }}
                >
                  {t("cancel")}
                </Button>
              )}
              {status?.tmdb.source === "user" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => clearGroup({ tmdbApiKey: "" }, "tmdb")}
                >
                  {t("settings.integrations.clear")}
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditing((prev) => ({ ...prev, tmdb: true }))}
            >
              {t("settings.integrations.edit")}
            </Button>
            {status?.tmdb.source === "user" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isSaving}
                onClick={() => clearGroup({ tmdbApiKey: "" }, "tmdb")}
              >
                {t("settings.integrations.clear")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* IGDB */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <p className="font-medium text-step-1">{t("settings.integrations.igdb.label")}</p>
            <IntegrationHelp api="igdb" />
          </div>
          <span className="text-step-0 text-muted-foreground">
            {statusLabel(status?.igdb)}
          </span>
        </div>

        {igdbEditing ? (
          <>
            <Input
              {...noAutofillProps}
              name="igdbClientId"
              placeholder={t("settings.integrations.igdb.clientIdPlaceholder")}
              value={igdbClientId}
              onChange={(event) => setIgdbClientId(event.target.value)}
            />
            <Input
              {...noAutofillProps}
              name="igdbClientSecret"
              placeholder={t("settings.integrations.igdb.clientSecretPlaceholder")}
              value={igdbClientSecret}
              onChange={(event) => setIgdbClientSecret(event.target.value)}
            />
            <p className="text-step-0 text-muted-foreground">
              {t("settings.integrations.igdb.hint")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={saveIgdb} disabled={isSaving}>
                {t("save")}
              </Button>
              {igdbConfigured && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => {
                    setIgdbClientId("");
                    setIgdbClientSecret("");
                    setEditing((prev) => ({ ...prev, igdb: false }));
                  }}
                >
                  {t("cancel")}
                </Button>
              )}
              {status?.igdb.source === "user" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() =>
                    clearGroup({ igdbClientId: "", igdbClientSecret: "" }, "igdb")
                  }
                >
                  {t("settings.integrations.clear")}
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditing((prev) => ({ ...prev, igdb: true }))}
            >
              {t("settings.integrations.edit")}
            </Button>
            {status?.igdb.source === "user" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isSaving}
                onClick={() =>
                  clearGroup({ igdbClientId: "", igdbClientSecret: "" }, "igdb")
                }
              >
                {t("settings.integrations.clear")}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default IntegrationKeysForm;
