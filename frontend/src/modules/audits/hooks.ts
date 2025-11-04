import { useMemo } from "react";
import {
  useInfiniteQuery,
  useQuery,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createAuditHistoryFallback,
  createAuditPerformanceFallback,
  createAuditQueueFallback,
  createAuditSummaryFallback,
  createPendingAuditsFallback,
  fetchAuditHistory,
  fetchAuditPerformance,
  fetchPendingAudits,
  fetchAuditQueue,
  fetchAuditSummary,
  type AuditHistoryRow,
  type AuditPerformanceResult,
  type AuditSummaryCard,
  type AuditQueueResult,
  type AuditHistoryResult,
  type PendingAuditsResult,
} from "@/lib/gateways";

export const auditSummaryQueryKey = ["audits", "summary"] as const;
export const auditQueueQueryKey = ["audits", "queue"] as const;
export const auditHistoryQueryKey = ["audits", "history"] as const;
export const auditPerformanceQueryKey = ["audits", "performance"] as const;
export const auditPendingQueryKey = ["audits", "pending"] as const;

export type UseAuditSummaryResult = UseQueryResult<AuditSummaryCard[]>;
export type UseAuditQueueResult = UseInfiniteQueryResult<AuditQueueResult, unknown>;
export type UseAuditHistoryResult = UseInfiniteQueryResult<AuditHistoryResult, unknown>;
export type UseAuditPerformanceResult = UseQueryResult<AuditPerformanceResult>;
export type UseAuditPendingResult = UseQueryResult<PendingAuditsResult>;

export function useAuditSummary(): UseAuditSummaryResult {
  const fallback = useMemo(() => createAuditSummaryFallback(), []);

  return useQuery({
    queryKey: auditSummaryQueryKey,
    queryFn: ({ signal }) => fetchAuditSummary({ signal }),
    placeholderData: fallback,
    staleTime: 60_000,
  });
}

export function useAuditQueue(): UseAuditQueueResult {
  const fallback = useMemo(() => createAuditQueueFallback(), []);

  return useInfiniteQuery({
    queryKey: auditQueueQueryKey,
    initialPageParam: null as string | null,
    queryFn: ({ signal, pageParam }) =>
      fetchAuditQueue({ signal, cursor: pageParam, limit: 3 }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: {
      pages: [fallback],
      pageParams: [null],
    },
    refetchInterval: 5000,
  });
}

export function useAuditHistory(): UseAuditHistoryResult {
  const fallback = useMemo(() => createAuditHistoryFallback(), []);

  return useInfiniteQuery({
    queryKey: auditHistoryQueryKey,
    initialPageParam: null as string | null,
    queryFn: ({ signal, pageParam }) =>
      fetchAuditHistory({ signal, cursor: pageParam, limit: 5 }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: {
      pages: [fallback],
      pageParams: [null],
    },
    refetchInterval: 10000,
  });
}

export function useAuditPerformance(): UseAuditPerformanceResult {
  const fallback = useMemo(() => createAuditPerformanceFallback(), []);

  return useQuery({
    queryKey: auditPerformanceQueryKey,
    queryFn: ({ signal }) => fetchAuditPerformance({ signal }),
    placeholderData: fallback,
    staleTime: 60_000,
  });
}

export function useAuditPending(): UseAuditPendingResult {
  const fallback = useMemo(() => createPendingAuditsFallback(), []);

  return useQuery({
    queryKey: auditPendingQueryKey,
    queryFn: ({ signal }) => fetchPendingAudits({ signal }),
    placeholderData: fallback,
    staleTime: 60_000,
    refetchInterval: 5000,
  });
}
