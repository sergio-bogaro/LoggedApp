import { t } from "i18next";
import { Search, Settings } from "lucide-react";
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
    <div className="flex items-center justify-between w-full">
      <Link to="/media/home" className="transition-colors hover:text-foreground/80 font-bold text-lg">
        LOGGED APP
      </Link>

      {!isSearchPage && (
        <div className="hidden">
          <Form {...form}>
            <form className='w-full flex gap-1 items-end pb-3' onSubmit={form.handleSubmit(onSearch)}>
              <Select
                options={mediaTypesOptions}
                name='mediaType'
                control={control}
                placeholder={t("mediaType")}
              />

              <Input
                name='searchFilter'
                control={control}
                placeholder={t("placeholder")}
              />

              <Button>
                <Search />
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}