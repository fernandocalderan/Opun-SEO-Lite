"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AuditHistory } from "./AuditHistory";
import { useAuditHistory } from "./hooks";
import { createAuditHistoryFallback } from "@/lib/gateways";
import { fetchAuditResult } from "@/lib/gateways/audits";
import { AuditResultModal } from "./AuditResultModal";

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

  const pages: any[] = ((data as any)?.pages ?? [fallback]) as any[];
  const items = pages.flatMap((page: any) => page.items);
  const total = pages[0]?.total ?? fallback.total;
  const [openId, setOpenId] = useState<string | null>(null);
  const [result, setResult] = useState<any | { status: "pending" } | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const close = () => {
    setOpenId(null);
    setResult(null);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const handleView = async (id: string) => {
    setOpenId(id);
    setResult(null);
    const first = await fetchAuditResult(id);
    setResult(first);
    if (first && "status" in first && first.status === "pending") {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const next = await fetchAuditResult(id);
        if (next && !("status" in next && next.status === "pending")) {
          setResult(next);
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      }, 3000);
    }
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  return (
    <>
      <AuditHistory
        items={items}
        total={total}
        onRefresh={() => void refetch()}
        isLoading={isLoading}
        hasMore={Boolean(hasNextPage)}
        onLoadMore={hasNextPage ? () => fetchNextPage() : undefined}
        isLoadingMore={isFetchingNextPage}
        onViewResult={handleView}
      />
      {openId ? (
        <AuditResultModal id={openId} content={result} onClose={close} />
      ) : null}
    </>
  );
}
