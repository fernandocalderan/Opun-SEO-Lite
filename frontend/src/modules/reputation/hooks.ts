"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchReputationChannels, fetchReputationMentions, fetchReputationSummary, fetchReputationTimeline } from "@/lib/gateways/reputation";

export function useReputationSummary() {
  return useQuery({ queryKey: ["reputation","summary"], queryFn: () => fetchReputationSummary(), staleTime: 60_000 });
}

export function useReputationTimeline() {
  return useQuery({ queryKey: ["reputation","timeline"], queryFn: () => fetchReputationTimeline(), staleTime: 60_000, refetchInterval: 30000 });
}

export function useReputationChannels() {
  return useQuery({ queryKey: ["reputation","channels"], queryFn: () => fetchReputationChannels(), staleTime: 60_000 });
}

export function useReputationMentions() {
  return useQuery({ queryKey: ["reputation","mentions"], queryFn: () => fetchReputationMentions(), staleTime: 30_000, refetchInterval: 30000 });
}

