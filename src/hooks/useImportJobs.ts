import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

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

export const IMPORT_JOBS_LIMIT = 50;

/**
 * Jobs prontos para revisão; alimenta o badge e os avisos globais.
 *
 * Usa a mesma lista recente da página Importar para não manter duas consultas
 * concorrentes. O polling só existe enquanto a lista tem job ativo.
 */
export function useReadyImportJobs(userId?: number) {
  const query = useImportJobs(userId);
  const data = useMemo(
    () => query.data?.filter((job) => job.status === "ready"),
    [query.data]
  );
  return { ...query, data };
}

/**
 * Lista de importações recentes.
 *
 * O endpoint só é consultado periodicamente enquanto existe job em
 * queued/parsing/matching. Sem trabalho ativo, sobra apenas o refetch ao
 * focar a janela ou uma invalidação explícita.
 */
export function useImportJobs(
  userId?: number,
  limit = IMPORT_JOBS_LIMIT
) {
  return useQuery({
    queryKey: ["import-jobs", "list", userId, limit],
    queryFn: () => listImportJobs(userId!, undefined, limit),
    enabled: !!userId,
    refetchInterval: (query) => {
      const jobs = query.state.data;
      return jobs?.some((job) => isActiveJobStatus(job.status)) ? 5_000 : false;
    },
    refetchIntervalInBackground: false,
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
