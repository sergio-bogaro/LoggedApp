import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import { PageHeader } from "@/components/tw/generic/PageHeader";
import ImportManager from "@/components/tw/import/ImportManager";
import { UnifiedReviewInbox } from "@/components/tw/import/UnifiedReviewInbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReviewCounts } from "@/hooks/useReviewCounts";
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
  const { manualReady, syncPending, total: reviewTotal } = useReviewCounts(user?.id);

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

      {tab === "manual" && reviewTotal > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-primary/30 bg-primary/5 p-3">
          <div className="space-y-1">
            <p className="text-step-1 font-medium">
              {t("review.banner.title", { count: reviewTotal })}
            </p>
            <p className="text-step-0 text-muted-foreground">
              {t("review.banner.description", {
                manual: manualReady,
                sync: syncPending,
              })}
            </p>
          </div>
          <Button type="button" size="sm" onClick={() => setTab("auto")}>
            {t("review.banner.action")}
          </Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="manual">{t("tabs.manual")}</TabsTrigger>
          <TabsTrigger value="auto">
            {t("tabs.review")}
            {reviewTotal > 0 ? ` (${reviewTotal})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4">
          <ImportManager />
        </TabsContent>

        <TabsContent value="auto" className="mt-4">
          <UnifiedReviewInbox provider={provider} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ImportPage;
