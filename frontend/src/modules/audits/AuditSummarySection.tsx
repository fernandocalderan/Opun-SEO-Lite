"use client";

import { useAuditSummary } from "./hooks";
import { AuditSummary } from "./AuditSummary";
import { createAuditSummaryFallback } from "@/lib/gateways";

export function AuditSummarySection() {
  const { data, isLoading, isError, refetch } = useAuditSummary();

  if (isError && !data) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 text-sm text-text-muted shadow-soft">
        <div className="space-y-3 text-center">
          <h2 className="text-base font-semibold text-text-heading">
            No se pudo cargar el resumen de auditorias
          </h2>
          <p>
            Verifica la conexion con el backend y vuelve a intentarlo.
          </p>
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

  const items = data ?? createAuditSummaryFallback();

  if (isLoading && !data) {
    return <AuditSummary items={items} />;
  }

  return <AuditSummary items={items} />;
}
