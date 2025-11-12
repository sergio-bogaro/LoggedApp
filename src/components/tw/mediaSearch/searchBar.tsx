import { Grid, List, Search } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { Button } from "../../ui/button";
import { Form } from "../../ui/form";
import { Input } from "../../ui/input";

import { useAppDispatch, useAppSelector } from "@/store/settings/hooks";
import { setViewMode, ViewMode } from "@/store/settings/slice";
import { getPageTranslation, MediaTypeEnum } from "@/utils/mediaText";

export type FormSearchProps = {
  searchFilter: string;
}

interface SearchContainerProps {
  onSearch: (term: string) => void;
  page?: MediaTypeEnum;
  defaultValue?: string;
}

export const SearchContainer = ({ onSearch, page, defaultValue }: SearchContainerProps) => {
  const { viewMode } = useAppSelector(state => state.ui)
  const isGrid = useMemo(() => viewMode === "grid", [viewMode]);
  const dispatch = useAppDispatch()
  
  const handleViewModeChange = (newTheme: ViewMode) => {
    dispatch(setViewMode(newTheme))
  }

  const { label, placeholder } = getPageTranslation(page);

  const form = useForm<FormSearchProps>({ 
    defaultValues: { searchFilter: defaultValue || "" }
  });
  const { control } = form;

  function onSubmit(data: FormSearchProps) {
    onSearch(data.searchFilter || "");
  }

  return (
    <div>
      <div className="backdrop-blur-sm border-b mb-4">
        <Form {...form}>
          <form className='w-full flex gap-1 items-end pb-3' onSubmit={form.handleSubmit(onSubmit)}>
            <Button type="button" variant="outline" onClick={() => handleViewModeChange(isGrid ? "list" : "grid")}>
              <Grid className={`h-[1.2rem] w-[1.2rem] scale-0 -rotate-90  transition-all ${isGrid && "scale-100 rotate-0"} `} />
              <List className={`absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-0 transition-all ${!isGrid && "scale-100 -rotate-90"}`} />
            </Button>
            <Input
              name='searchFilter'
              control={control}
              label={label}
              placeholder={placeholder}
            />
            <Button>
              <Search />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

