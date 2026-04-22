import { t } from "i18next";
import { Search } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MediaTypeEnum } from "@/types/media";
import { mediaTypesOptions } from "@/utils/mediaText";

export type MediaSearchHeaderProps = {
  searchFilter: string;
  mediaType: MediaTypeEnum;
}

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = useMemo(() => location.pathname.includes("search"), [location]);

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
        LOGGED APP
      </Link>

      {!isSearchPage && (
        <Form {...form}>
          <form className="flex gap-2 items-end w-md" onSubmit={form.handleSubmit(onSearch)}>
            <Select
              options={mediaTypesOptions}
              name="mediaType"
              control={control}
              placeholder={t("mediaType")}
              width={200}
            />

            <Input
              name="searchFilter"
              control={control}
              placeholder={t("placeholder")}
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
