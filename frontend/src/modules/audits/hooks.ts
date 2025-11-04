import { useMemo } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  createAuditHistoryFallback,
  createAuditPerformanceFallback,
  createAuditQueueFallback,
  createAuditSummaryFallback,
  fetchAuditHistory,
  fetchAuditPerformance,
  fetchAuditQueue,
  fetchAuditSummary,
  type AuditHistoryRow,
  type AuditPerformanceDatum,
  type AuditQueueCard,
  type AuditSummaryCard,
} from "@/lib/gateways";

export const auditSummaryQueryKey = ["audits", "summary"] as const;
export const auditQueueQueryKey = ["audits", "queue"] as const;
export const auditHistoryQueryKey = ["audits", "history"] as const;
export const auditPerformanceQueryKey = ["audits", "performance"] as const;

export type UseAuditSummaryResult = UseQueryResult<AuditSummaryCard[]>;
export type UseAuditQueueResult = UseQueryResult<AuditQueueCard[]>;
export type UseAuditHistoryResult = UseQueryResult<AuditHistoryRow[]>;
export type UseAuditPerformanceResult = UseQueryResult<AuditPerformanceDatum[]>;

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

  return useQuery({
    queryKey: auditQueueQueryKey,
    queryFn: ({ signal }) => fetchAuditQueue({ signal }),
    placeholderData: fallback,
    staleTime: 60_000,
  });
}

export function useAuditHistory(): UseAuditHistoryResult {
  const fallback = useMemo(() => createAuditHistoryFallback(), []);

  return useQuery({
    queryKey: auditHistoryQueryKey,
    queryFn: ({ signal }) => fetchAuditHistory({ signal }),
    placeholderData: fallback,
    staleTime: 60_000,
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
