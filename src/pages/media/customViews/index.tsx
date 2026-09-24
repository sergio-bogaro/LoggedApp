import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { CustomViewDialog } from "@/components/tw/dialogs/customViewDialog";
import { ConfirmDialog } from "@/components/tw/generic/confirmDialog";
import { EmptyState } from "@/components/tw/generic/EmptyState";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { Button } from "@/components/ui/button";
import { deleteCustomView, getCustomViews, reorderCustomViews } from "@/querries/customViews";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { CustomView } from "@/types/customView";
import { DEFAULT_STALE_TIME } from "@/utils/conts";

function CustomViewsPage() {
  const { t } = useTranslation("media");
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CustomView | null>(null);
  const [deleting, setDeleting] = useState<CustomView | null>(null);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: t("label"), to: "/media/home" },
        { label: t("customView.title") },
      ])
    );
  }, [dispatch, t]);

  const { data: views } = useQuery({
    queryKey: ["customViews", user?.id],
    queryFn: () => getCustomViews(user!.id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (view: CustomView) => deleteCustomView(view.id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customViews"] });
      toast.success(t("customView.deleted"));
      setDeleting(null);
    },
    onError: (error: Error) => toast.error(error.message || t("customView.saveFailed")),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { viewId: number; newOrder: number }[]) =>
      reorderCustomViews(user!.id, items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customViews"] }),
    onError: (error: Error) => toast.error(error.message || t("customView.saveFailed")),
  });

  const move = (index: number, delta: number) => {
    if (!views) return;
    const target = index + delta;
    if (target < 0 || target >= views.length) return;

    const next = [...views];
    [next[index], next[target]] = [next[target], next[index]];
    reorderMutation.mutate(next.map((view, position) => ({ viewId: view.id, newOrder: position })));
  };

  return (
    <div className="w-full space-y-4">
      <PageHeader title={t("customView.title")} />

      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus aria-hidden="true" />
          {t("customView.newView")}
        </Button>
      </div>

      {!views || views.length === 0 ? (
        <EmptyState title={t("customView.emptyManager")} className="mt-4" />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {views.map((view, index) => (
            <li key={view.id} className="flex items-center gap-2 p-3">
              <span className="w-6 text-center text-step-3" aria-hidden="true">
                {view.icon ?? "•"}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-step-2 font-medium">{view.name}</p>
                {view.description && (
                  <p className="truncate text-step-0 text-muted-foreground">{view.description}</p>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => move(index, -1)}
                disabled={index === 0 || reorderMutation.isPending}
                aria-label={t("customView.moveUp")}
              >
                <ArrowUp aria-hidden="true" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => move(index, 1)}
                disabled={index === views.length - 1 || reorderMutation.isPending}
                aria-label={t("customView.moveDown")}
              >
                <ArrowDown aria-hidden="true" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditing(view);
                  setDialogOpen(true);
                }}
                aria-label={t("customView.editView")}
              >
                <Pencil aria-hidden="true" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleting(view)}
                aria-label={t("actions.deleteLog")}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <CustomViewDialog open={dialogOpen} onOpenChange={setDialogOpen} view={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(next) => {
          if (!next) setDeleting(null);
        }}
        title={t("customView.deleteTitle")}
        description={t("customView.deleteDescription")}
        onConfirm={() => deleting && deleteMutation.mutate(deleting)}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

export default CustomViewsPage;
