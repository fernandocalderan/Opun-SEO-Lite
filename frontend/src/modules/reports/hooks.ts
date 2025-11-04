"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchReportActivity, fetchReportList, fetchReportTemplates } from "@/lib/gateways/reports";

export function useReportList() {
  return useQuery({ queryKey: ["reports","list"], queryFn: () => fetchReportList(), staleTime: 60000 });
}
export function useReportTemplates() {
  return useQuery({ queryKey: ["reports","templates"], queryFn: () => fetchReportTemplates(), staleTime: 60000 });
}
export function useReportActivity() {
  return useQuery({ queryKey: ["reports","activity"], queryFn: () => fetchReportActivity(), staleTime: 60000 });
}

