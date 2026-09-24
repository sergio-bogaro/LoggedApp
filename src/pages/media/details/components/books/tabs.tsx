import { useTranslation } from "react-i18next";

import { BookDetailsView } from "./details";

import { AppTabs } from "@/components/tw/tabs";
import { BookDetails } from "@/querries/externalMedia/books";

export function BookTabs({ data }: { data: BookDetails }) {
  const { t } = useTranslation("media");
  const subjects = data.subjects ?? [];

  return (
    <AppTabs
      defaultValue="details"
      options={[
        {
          label: t("details.label"),
          value: "details",
          content: <BookDetailsView data={data} />,
        },
        {
          label: t("bookTabs.subjects"),
          value: "subjects",
          content: subjects.length ? (
            <div className="flex flex-wrap gap-2 py-2">
              {subjects.map((subject) => (
                <span
                  key={subject}
                  className="rounded-control border border-border px-2 py-1 text-step-1"
                >
                  {subject}
                </span>
              ))}
            </div>
          ) : (
            <p className="py-4 text-step-1 text-muted-foreground">
              {t("bookTabs.empty.subjects")}
            </p>
          ),
        },
      ]}
    />
  );
}
