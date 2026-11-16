import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getImportJob,
  getImportJobItems,
  listImportJobs,
} from "@/querries/import";
import type { ImportJobStatus } from "@/types/importJob";

export const ACTIVE_JOB_STATUSES: ImportJobStatus[] = [
  "queued",
  "parsing",
  "matching",
];

export function isActiveJobStatus(status?: ImportJobStatus | null): boolean {
  return !!status && ACTIVE_JOB_STATUSES.includes(status);
}

/** Jobs prontos para revisão; alimenta o badge e os avisos globais. */
export function useReadyImportJobs(userId?: number) {
  return useQuery({
    queryKey: ["import-jobs", "ready", userId],
    queryFn: () => listImportJobs(userId!, "ready", 50),
    enabled: !!userId,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
}

/** Lista de importações recentes da página Importar. */
export function useImportJobs(userId?: number, limit = 20) {
  return useQuery({
    queryKey: ["import-jobs", "list", userId, limit],
    queryFn: () => listImportJobs(userId!, undefined, limit),
    enabled: !!userId,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
  });
}

/** Detalhe do job; faz polling enquanto está na fila/parse/matching. */
export function useImportJob(jobId?: number | null, userId?: number) {
  return useQuery({
    queryKey: ["import-job", jobId, userId],
    queryFn: () => getImportJob(jobId!, userId!),
    enabled: !!jobId && !!userId,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && isActiveJobStatus(data.status) ? 2_000 : false;
    },
    refetchOnWindowFocus: true,
  });
}

/** Itens da revisão, com paginação incremental. */
export function useImportJobItems(
  jobId: number | null | undefined,
  userId: number | undefined,
  filter: string,
  enabled: boolean,
  pageSize = 50
) {
  return useInfiniteQuery({
    queryKey: ["import-job-items", jobId, userId, filter],
    queryFn: ({ pageParam }) =>
      getImportJobItems(jobId!, userId!, filter, pageParam, pageSize),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.offset + lastPage.items.length;
      return loaded < lastPage.total ? lastPage.offset + lastPage.limit : undefined;
    },
    enabled: !!jobId && !!userId && enabled,
    refetchOnWindowFocus: false,
  });
}
