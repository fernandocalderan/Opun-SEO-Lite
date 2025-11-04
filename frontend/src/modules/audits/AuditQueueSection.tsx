"use client";

import { useMemo } from "react";
import { AuditQueue } from "./AuditQueue";
import { useAuditPending, useAuditQueue } from "./hooks";
import {
  createAuditQueueFallback,
  createPendingAuditsFallback,
} from "@/lib/gateways";

export function AuditQueueSection() {
  const fallbackQueue = useMemo(() => createAuditQueueFallback(), []);
  const fallbackPending = useMemo(() => createPendingAuditsFallback(), []);
  const {
    data,
    isError,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAuditQueue();
  const pendingQuery = useAuditPending();

  if (isError && !data) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 text-sm text-text-muted shadow-soft">
        <div className="space-y-3 text-center">
          <h2 className="text-base font-semibold text-text-heading">
            No se pudo cargar la cola de auditorias
          </h2>
          <p>Reintenta mas tarde o verifica la conexion con el servicio.</p>
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

  const pages = data?.pages ?? [fallbackQueue];
  const items = pages.flatMap((page) => page.items);
  const total = pages[0]?.total ?? fallbackQueue.total;
  const pendingResult = pendingQuery.data ?? fallbackPending;
  const pendingCount = pendingResult.count;

  return (
    <AuditQueue
      items={items}
      total={total}
      pendingCount={pendingCount}
      onRefresh={() => void refetch()}
      onLoadMore={hasNextPage ? () => fetchNextPage() : undefined}
      hasMore={Boolean(hasNextPage)}
      isLoading={isLoading}
      isLoadingMore={isFetchingNextPage}
    />
  );
}

    return (
      <section className="rounded-2xl border border-border bg-surface p-6 text-sm text-text-muted shadow-soft">
        <div className="space-y-3 text-center">
          <h2 className="text-base font-semibold text-text-heading">
            No se pudo cargar la cola de auditorias
          </h2>
          <p>Reintenta mas tarde o verifica la conexion con el servicio.</p>
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

  const resultado = data ?? fallback;

  return (
    <AuditQueue
      items={resultado.items}
      total={resultado.total}
      onRefresh={() => void refetch()}
      isLoading={isLoading}
    />
  );
}
