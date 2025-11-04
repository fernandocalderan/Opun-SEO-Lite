import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  createAuditSummaryFallback,
  fetchAuditSummary,
  type AuditSummaryCard,
} from "@/lib/gateways";

export const auditSummaryQueryKey = ["audits", "summary"] as const;

export type UseAuditSummaryResult = UseQueryResult<AuditSummaryCard[]>;

export function useAuditSummary(): UseAuditSummaryResult {
  return useQuery({
    queryKey: auditSummaryQueryKey,
    queryFn: ({ signal }) => fetchAuditSummary({ signal }),
    placeholderData: () => createAuditSummaryFallback(),
    staleTime: 60_000,
  });
}
