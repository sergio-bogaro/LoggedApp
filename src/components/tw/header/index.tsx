import { t } from "i18next";
import { PersonStanding, Search } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MediaTypeEnum, mediaTypesOptions } from "@/utils/mediaText";

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
    const path = `/logger/search${query ? `?${query}` : ""}`;

    navigate(path);
  }

  return (
    <div className="flex items-center justify-between px-4 w-full h-14 border-b sticky top-0 self-start bg-background shadow-md z-10">
      <h1 className="font-bold text-2xl">LOGGED APP</h1>
      {!isSearchPage && (
        <div className="">
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

      <Button asChild variant="outline" size="icon" className="rounded-full">
        <Link to="/logger/settings">
          <PersonStanding />
        </Link>
      </Button>
    </div>
  )
}