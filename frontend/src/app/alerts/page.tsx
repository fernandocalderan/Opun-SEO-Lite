"use client";

import { ReputationAlerts } from "@/components/ReputationAlerts";
import { reputationAlerts } from "@/lib/mocks";
import { useAuditPending } from "@/modules/audits/hooks";

export default function AlertsPage() {
  const pending = useAuditPending();

  return (
    <div className="space-y-6 p-8">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-brand-primary">
          Alerts Command Center
        </span>
        <h1 className="text-3xl font-semibold text-text-heading">Monitoreo y alertas</h1>
        <p className="text-sm text-text-body">
          Visualiza auditorias pendientes y menciones críticas en tiempo real.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-heading">Auditorias pendientes</h2>
          <span className="text-sm text-text-muted">
            {pending.data?.count ?? 0} en cola
          </span>
        </header>
        {(pending.data?.items ?? []).length ? (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="min-w-full table-fixed text-sm">
              <thead className="bg-surface-subtle text-left font-medium text-text-body">
                <tr>
                  <th className="px-4 py-3">Proyecto</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Inicio</th>
                  <th className="px-4 py-3">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(pending.data?.items ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-text-heading">{item.project}</td>
                    <td className="px-4 py-3">{item.type}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">{item.startedAt}</td>
                    <td className="px-4 py-3">{item.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
            No hay auditorias pendientes
          </div>
        )}
      </section>

      <ReputationAlerts alerts={reputationAlerts as any} />
    </div>
  );
}

