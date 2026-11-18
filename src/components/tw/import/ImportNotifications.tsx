import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { useReadyImportJobs } from "@/hooks/useImportJobs";
import { useAppSelector } from "@/store/auth/hooks";

/**
 * Avisa globalmente quando um job termina o matching. O toast fica aberto até
 * ser fechado e leva direto para a revisão.
 */
export function ImportNotifications() {
  const { user } = useAppSelector((state) => state.auth);
  const { data } = useReadyImportJobs(user?.id);
  const { t } = useTranslation(["import", "common"]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const shown = useRef<Set<number>>(new Set());

  useEffect(() => {
    const readyJobs = data ?? [];
    const readyIds = new Set(readyJobs.map((job) => job.id));

    if (readyJobs.length > 0) {
      queryClient.invalidateQueries({ queryKey: ["review"] });
    }

    for (const jobId of Array.from(shown.current)) {
      if (!readyIds.has(jobId)) {
        toast.dismiss(`import-ready-${jobId}`);
        shown.current.delete(jobId);
      }
    }

    for (const job of readyJobs) {
      if (shown.current.has(job.id)) continue;
      shown.current.add(job.id);

      const provider = t(`providers.${job.provider}.label`, {
        defaultValue: job.provider,
      });
      const count = job.counts?.total ?? job.progressTotal;
      const toastId = `import-ready-${job.id}`;

      toast.message(t("jobs.readyToastTitle"), {
        id: toastId,
        description: t("jobs.readyToastDescription", { provider, count }),
        duration: Infinity,
        closeButton: true,
        action: {
          label: t("jobs.review"),
          onClick: () => {
            toast.dismiss(toastId);
            navigate(`/import?job=${job.id}`);
          },
        },
      });
    }
  }, [data, navigate, queryClient, t]);

  return null;
}
