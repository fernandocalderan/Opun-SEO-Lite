"use client";

import { useMemo } from "react";
import { AuditHistory } from "./AuditHistory";
import { useAuditHistory } from "./hooks";
import { createAuditHistoryFallback } from "@/lib/gateways";

export function AuditHistorySection() {
  const fallback = useMemo(() => createAuditHistoryFallback(), []);
  const { data, isError, isLoading, refetch } = useAuditHistory();

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

  const resultado = data ?? fallback;

  return (
    <AuditHistory
      items={resultado.items}
      total={resultado.total}
      onRefresh={() => void refetch()}
      isLoading={isLoading}
    />
  );
}
