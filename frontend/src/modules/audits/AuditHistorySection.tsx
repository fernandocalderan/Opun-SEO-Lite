"use client";

import { useMemo } from "react";
import { AuditHistory } from "./AuditHistory";
import { useAuditHistory } from "./hooks";
import { createAuditHistoryFallback, type AuditHistoryResult, type AuditHistoryRow } from "@/lib/gateways";
import { useRouter } from "next/navigation";

export function AuditHistorySection() {
  const fallback = useMemo(() => createAuditHistoryFallback(), []);
  const {
    data,
    isError,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAuditHistory();
  const router = useRouter();

  if (isError && !data) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 text-sm text-text-muted shadow-soft">
        <div className="space-y-3 text-center">
          <h2 className="text-base font-semibold text-text-heading">
            No se pudo cargar el historial de auditorias
          </h2>
          <p>Reintenta mas tarde o revisa el estado del backend.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center justify-center rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  const pages: AuditHistoryResult[] = (data?.pages ?? [fallback]) as AuditHistoryResult[];
  const itemsRaw: AuditHistoryRow[] = pages.flatMap((page) => page.items);
  const seen = new Set<string>();
  const items = itemsRaw.filter((it) => {
    if (!it?.id) return true;
    if (seen.has(it.id)) return false;
    seen.add(it.id);
    return true;
  });
  const total = pages[0]?.total ?? fallback.total;
  const handleOpenInSeo = (id: string) => {
    router.push(`/seo?id=${encodeURIComponent(id)}`);
  };

  return (
    <AuditHistory
      items={items}
      total={total}
      onRefresh={() => void refetch()}
      isLoading={isLoading}
      hasMore={Boolean(hasNextPage)}
      onLoadMore={hasNextPage ? () => fetchNextPage() : undefined}
      isLoadingMore={isFetchingNextPage}
      onViewResult={handleOpenInSeo}
    />
  );
}
