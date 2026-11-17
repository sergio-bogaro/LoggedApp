import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import { PageHeader } from "@/components/tw/generic/PageHeader";
import { AutomaticImports } from "@/components/tw/import/AutomaticImports";
import ImportManager from "@/components/tw/import/ImportManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSyncSuggestionCount } from "@/hooks/useSyncSuggestions";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";

function ImportPage() {
  const { t } = useTranslation("import");
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "auto" ? "auto" : "manual";
  const provider = searchParams.get("provider") ?? undefined;
  const { data: pendingCount } = useSyncSuggestionCount(user?.id);
  const pendingReview = pendingCount?.pending ?? 0;

  const setTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "auto") {
      next.set("tab", "auto");
      next.delete("provider");
    } else {
      next.delete("tab");
    }
    setSearchParams(next);
  };

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: t("label", { ns: "media" }), to: "/media/home" },
        { label: t("page.title") },
      ])
    );
  }, [dispatch, t]);

  return (
    <div className="w-full space-y-4">
      <PageHeader title={t("page.title")} description={t("page.description")} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="manual">{t("tabs.manual")}</TabsTrigger>
          <TabsTrigger value="auto">
            {t("tabs.automatic")}
            {pendingReview > 0 ? ` (${pendingReview})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4">
          <ImportManager />
        </TabsContent>

        <TabsContent value="auto" className="mt-4">
          <AutomaticImports provider={provider} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ImportPage;
