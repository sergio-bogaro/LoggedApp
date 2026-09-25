import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { TagMultiSelect } from "@/components/tw/generic/tagMultiSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createCustomView, updateCustomView } from "@/querries/customViews";
import { getTags } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { CustomView, CustomViewDisplaySettings, CustomViewFilters } from "@/types/customView";
import { MediaTypeEnum } from "@/types/media";
import { DEFAULT_STALE_TIME } from "@/utils/conts";
import { getMediaTypesOptions } from "@/utils/mediaText";
import { statusAnimeOptions } from "@/utils/selectOptions";

const ANY = "__any__";

interface CustomViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view?: CustomView | null;
}

interface FormType {
  name: string;
  icon?: string;
  mediaType: string;
  status: string;
  minRating?: string | number;
  tags: string[];
  viewMode: "grid" | "list";
  sortBy: "title" | "rating" | "created_at" | "release_date" | "updated_at";
  sortOrder: "asc" | "desc";
}

const toOptionalNumber = (value?: string | number) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildDefaults = (view?: CustomView | null): FormType => ({
  name: view?.name ?? "",
  icon: view?.icon ?? "",
  mediaType: view?.filters?.media_types?.[0] ?? ANY,
  status: view?.filters?.status?.[0] ?? ANY,
  minRating: view?.filters?.min_rating ?? "",
  tags: view?.filters?.tags ?? [],
  viewMode: view?.displaySettings?.view_mode ?? "grid",
  sortBy: view?.displaySettings?.sort_by ?? "updated_at",
  sortOrder: view?.displaySettings?.sort_order ?? "desc",
});

export function CustomViewDialog({ open, onOpenChange, view }: CustomViewDialogProps) {
  const { t } = useTranslation("media");
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const form = useForm<FormType>({ defaultValues: buildDefaults(view) });
  const { control, handleSubmit } = form;

  useEffect(() => {
    if (open) form.reset(buildDefaults(view));
  }, [open, view]);

  const mediaTypeOptions = useMemo(
    () => [{ value: ANY, label: t("customView.any") }, ...getMediaTypesOptions(t)],
    [t]
  );

  const statusOptions = useMemo(
    () => [{ value: ANY, label: t("customView.any") }, ...statusAnimeOptions()],
    [t]
  );

  /* Tags offered as filters are scoped to the chosen media type: a view can
     only reference tags that actually exist there. With "any" type, all tags. */
  const selectedMediaType = useWatch({ control, name: "mediaType" });
  const tagMediaType =
    selectedMediaType && selectedMediaType !== ANY
      ? (selectedMediaType as MediaTypeEnum)
      : undefined;

  const { data: tagOptions } = useQuery<string[]>({
    queryKey: ["media", "tags", user?.id, tagMediaType],
    queryFn: () => getTags(user!.id, tagMediaType),
    staleTime: DEFAULT_STALE_TIME,
    enabled: open && !!user,
  });

  /* Switching type drops tags that no longer exist in it, so the saved filter
     cannot reference a tag the type does not have. Re-checked on open. */
  useEffect(() => {
    if (!open || !tagOptions) return;

    const current = form.getValues("tags") ?? [];
    const pruned = current.filter((tag) => tagOptions.includes(tag));
    if (pruned.length !== current.length) form.setValue("tags", pruned);
  }, [open, tagOptions, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormType) => {
      if (!user) throw new Error("User not authenticated");

      const filters: CustomViewFilters = {};
      if (data.mediaType !== ANY) filters.media_types = [data.mediaType];
      if (data.status !== ANY) filters.status = [data.status];

      const minRating = toOptionalNumber(data.minRating);
      if (minRating != null) filters.min_rating = minRating;
      if (data.tags.length > 0) filters.tags = data.tags;

      const displaySettings: CustomViewDisplaySettings = {
        view_mode: data.viewMode,
        sort_by: data.sortBy,
        sort_order: data.sortOrder,
      };

      if (view) {
        return updateCustomView(view.id, user.id, {
          name: data.name,
          icon: data.icon,
          filters,
          displaySettings,
        });
      }

      return createCustomView({
        userId: user.id,
        name: data.name,
        icon: data.icon,
        filters,
        displaySettings,
        isVisible: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customViews"] });
      toast.success(t("customView.saved"));
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("customView.saveFailed"));
    },
  });

  const onSubmit = (data: FormType) => saveMutation.mutate(data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{view ? t("customView.editView") : t("customView.newView")}</DialogTitle>
          <DialogDescription>{t("customView.filters")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-[1fr_5rem] gap-4">
              <Input name="name" label={t("customView.name")} control={control} required />
              <Input name="icon" label={t("customView.icon")} control={control} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                name="mediaType"
                label={t("customView.mediaType")}
                control={control}
                options={mediaTypeOptions}
              />

              <Select
                name="status"
                label={t("customView.status")}
                control={control}
                options={statusOptions}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                min={0}
                max={10}
                step="any"
                name="minRating"
                label={t("customView.minRating")}
                control={control}
              />

              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <TagMultiSelect
                    label={t("customView.tags")}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    options={tagOptions ?? []}
                    placeholder={t("tags.select")}
                    emptyLabel={t("tags.noneForType")}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Select
                name="viewMode"
                label={t("customView.viewMode")}
                control={control}
                options={[
                  { value: "grid", label: t("customView.grid") },
                  { value: "list", label: t("customView.list") },
                ]}
              />

              <Select
                name="sortBy"
                label={t("customView.sortBy")}
                control={control}
                options={[
                  { value: "updated_at", label: t("customView.sort.updated_at") },
                  { value: "created_at", label: t("customView.sort.created_at") },
                  { value: "title", label: t("customView.sort.title") },
                  { value: "rating", label: t("customView.sort.rating") },
                  { value: "release_date", label: t("customView.sort.release_date") },
                ]}
              />

              <Select
                name="sortOrder"
                label={t("customView.sortOrder")}
                control={control}
                options={[
                  { value: "desc", label: t("customView.desc") },
                  { value: "asc", label: t("customView.asc") },
                ]}
              />
            </div>

            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("cancel", { ns: "common" })}
                </Button>
              </DialogClose>

              <Button type="submit" disabled={saveMutation.isPending}>
                {view ? t("save", { ns: "common" }) : t("customView.create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
