"use client";

import { useMemo } from "react";
import { AuditQueue } from "./AuditQueue";
import { useAuditQueue } from "./hooks";
import { createAuditQueueFallback } from "@/lib/gateways";

export function AuditQueueSection() {
  const fallback = useMemo(() => createAuditQueueFallback(), []);
  const { data, isError, refetch } = useAuditQueue();

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

  const items = data ?? fallback;
  const key = data ? items.map((item) => item.id).join("|") : "fallback";

  return <AuditQueue key={key} items={items} />;
}
