"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPlanBoard, fetchPlanTable, fetchPlanVelocity } from "@/lib/gateways/plan";

export function usePlanBoard() {
  return useQuery({ queryKey: ["plan","board"], queryFn: () => fetchPlanBoard(), staleTime: 60000 });
}
export function usePlanTable() {
  return useQuery({ queryKey: ["plan","table"], queryFn: () => fetchPlanTable(), staleTime: 60000 });
}
export function usePlanVelocity() {
  return useQuery({ queryKey: ["plan","velocity"], queryFn: () => fetchPlanVelocity(), staleTime: 60000 });
}

