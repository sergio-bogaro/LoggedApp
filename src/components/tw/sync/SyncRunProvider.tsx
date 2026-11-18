import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { SyncProgressDialog } from "@/components/tw/sync/SyncProgressDialog";
import {
  getActiveSyncRun,
  getSyncRun,
  startSyncRun,
} from "@/querries/librarySync";
import { useAppSelector } from "@/store/auth/hooks";
import type { SyncRun } from "@/types/librarySync";

type SyncRunContextValue = {
  run: SyncRun | null;
  isRunning: boolean;
  dialogOpen: boolean;
  startSync: (scope: string) => Promise<void>;
  openDialog: () => void;
  closeDialog: () => void;
};

const SyncRunContext = createContext<SyncRunContextValue | null>(null);

export function useSyncRun(): SyncRunContextValue {
  const value = useContext(SyncRunContext);
  if (value === null) {
    throw new Error("useSyncRun precisa estar dentro de SyncRunProvider.");
  }
  return value;
}

export function SyncRunProvider({ children }: { children: ReactNode }) {
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation("librarySync");
  const queryClient = useQueryClient();
  const [runId, setRunId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const notifiedRun = useRef<string | null>(null);

  const { data: run } = useQuery({
    queryKey: ["sync-run", user?.id, runId],
    queryFn: () => getSyncRun(user!.id, runId!),
    enabled: !!user && !!runId,
    refetchInterval: (query) =>
      query.state.data?.status === "running" ? 1_000 : false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!user) return;
    let active = true;
    void getActiveSyncRun(user.id)
      .then((current) => {
        if (active && current) setRunId(current.id);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!run || run.status === "running") return;
    if (notifiedRun.current === run.id) return;
    notifiedRun.current = run.id;

    if (run.status === "success") {
      toast.success(t("syncRun.finishedToast"));
    } else if (run.status === "partial") {
      toast.warning(t("syncRun.partialToast"));
    } else {
      toast.error(run.error || t("syncRun.failedToast"));
    }

    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ["integrations"] }),
      queryClient.invalidateQueries({ queryKey: ["integration-statuses"] }),
      queryClient.invalidateQueries({ queryKey: ["global-sync-settings"] }),
      queryClient.invalidateQueries({ queryKey: ["suwayomi"] }),
      queryClient.invalidateQueries({ queryKey: ["media"] }),
      queryClient.invalidateQueries({ queryKey: ["existingMedia"] }),
      queryClient.invalidateQueries({ queryKey: ["media-logs"] }),
      queryClient.invalidateQueries({ queryKey: ["backlog"] }),
      queryClient.invalidateQueries({ queryKey: ["sync-suggestions"] }),
      queryClient.invalidateQueries({ queryKey: ["review"] }),
    ]);
  }, [run, queryClient, t]);

  const startSync = useCallback(
    async (scope: string) => {
      if (!user) return;
      try {
        const result = await startSyncRun(user.id, scope);
        setRunId(result.run.id);
        setDialogOpen(true);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("syncRun.startError")
        );
      }
    },
    [user, t]
  );

  const value = useMemo<SyncRunContextValue>(
    () => ({
      run: run ?? null,
      isRunning: run?.status === "running",
      dialogOpen,
      startSync,
      openDialog: () => setDialogOpen(true),
      closeDialog: () => setDialogOpen(false),
    }),
    [run, dialogOpen, startSync]
  );

  return (
    <SyncRunContext.Provider value={value}>
      {children}
      <SyncProgressDialog
        open={dialogOpen}
        run={run ?? null}
        onClose={() => setDialogOpen(false)}
      />
    </SyncRunContext.Provider>
  );
}
