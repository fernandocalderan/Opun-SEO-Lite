import { fetchOverview } from "@/lib/gateways";
import type { OverviewDataset } from "@/lib/gateways";
import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";

export const overviewQueryKey = ["overview"] as const;

export type UseOverviewQueryResult = UseQueryResult<OverviewDataset>;

export function useOverviewQuery(): UseOverviewQueryResult {
  return useQuery({
    queryKey: overviewQueryKey,
    queryFn: ({ signal }) => fetchOverview({ signal }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
