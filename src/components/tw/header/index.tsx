import { Search } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MediaTypeEnum } from "@/types/media";
import { getMediaTypesOptions } from "@/utils/mediaText";

export type MediaSearchHeaderProps = {
  searchFilter: string;
  mediaType: MediaTypeEnum;
}

export function Header() {
  const { t } = useTranslation(["common", "media"]);
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = useMemo(() => location.pathname.includes("search"), [location]);
  const mediaTypesOptions = useMemo(() => getMediaTypesOptions(t), [t]);

  const form = useForm<MediaSearchHeaderProps>({});
  const { control } = form;

  function onSearch(data: MediaSearchHeaderProps) {
    const { searchFilter, mediaType } = data;

    const params = new URLSearchParams();
    if (searchFilter && searchFilter.trim().length > 0) params.set("searchFilter", searchFilter);
    if (mediaType) params.set("mediaType", String(mediaType));

    const query = params.toString();
    const path = `/search${query ? `?${query}` : ""}`;

    navigate(path);
  }

  return (
    <div className="flex items-center justify-between w-full gap-4">
      <Link to="/media/home" className="transition-colors hover:text-foreground/80 font-bold text-lg shrink-0">
        {t("branding.headerName", { ns: "common" })}
      </Link>

      {!isSearchPage && (
        <Form {...form}>
          <form className="flex gap-2 items-end w-md" onSubmit={form.handleSubmit(onSearch)}>
            <Select
              options={mediaTypesOptions}
              name="mediaType"
              control={control}
              placeholder={t("searchForm.typePlaceholder", { ns: "media" })}
              width={200}
            />

            <Input
              name="searchFilter"
              control={control}
              placeholder={t("searchForm.searchPlaceholder", { ns: "media" })}
            />

            <Button type="submit" size="icon">
              <Search />
            </Button>
          </form>
        </Form>
      )}


    </div>
  );
}
