"use client";

import { useMemo } from "react";
import { AuditPerformance } from "./AuditPerformance";
import { useAuditPerformance } from "./hooks";
import { createAuditPerformanceFallback } from "@/lib/gateways";

export function AuditPerformanceSection() {
  const fallback = useMemo(() => createAuditPerformanceFallback(), []);
  const { data, isError, refetch } = useAuditPerformance();

  if (isError && !data) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 text-sm text-text-muted shadow-soft">
        <div className="space-y-3 text-center">
          <h2 className="text-base font-semibold text-text-heading">
            No se pudo cargar la tendencia de performance
          </h2>
          <p>Reintenta mas tarde o valida el estado del servicio de auditorias.</p>
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

  const items = data ?? fallback;

  return <AuditPerformance data={items} />;
}
