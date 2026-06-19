import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { MediaTypeEnum } from "@/types/media";

export type MediaSearchHeaderProps = {
  searchFilter: string;
  mediaType: MediaTypeEnum;
}

export function Header() {
  const { t } = useTranslation(["common", "media"]);

  return (
    <div className="flex items-center justify-between w-full gap-4">
      <Link to="/media/home" className="transition-colors hover:text-foreground/80 font-bold text-lg shrink-0">
        {t("branding.headerName", { ns: "common" })}
      </Link>
    </div>
  );
}
