import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/tw/generic/PageHeader";
import ImportManager from "@/components/tw/import/ImportManager";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";

function ImportPage() {
  const { t } = useTranslation("import");
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: t("label", { ns: "media" }), to: "/media/home" },
        { label: t("page.title") },
      ])
    );
  }, [dispatch, t]);

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader title={t("page.title")} description={t("page.description")} />
      <ImportManager />
    </div>
  );
}

export default ImportPage;
