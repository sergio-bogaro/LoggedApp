import { t } from "i18next";
import { Link } from "react-router";

import { DetailsLabel } from "../general/detailsCard";

import { BookDetails } from "@/querries/externalMedia/books";

export const BookDetailsView = ({ data }: { data: BookDetails }) => {
  const subjects = data.subjects ?? [];

  return (
    <div className="divide-y divide-border">
      <DetailsLabel
        label={t("details.releaseDate", { ns: "media" })}
        value={data.first_publish_date ?? " --- "}
      />

      <DetailsLabel
        label={t("bookTabs.subjects", { ns: "media" })}
        value={subjects.length ? subjects.slice(0, 8).join(", ") : " --- "}
      />

      <DetailsLabel
        label={t("details.source", { ns: "media" })}
        value={
          data.key ? (
            <Link to={`https://openlibrary.org${data.key}`} target="_blank">
              OpenLibrary
            </Link>
          ) : (
            " --- "
          )
        }
      />
    </div>
  );
};
