"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProjects, type Project } from "@/lib/gateways/projects";
import { useAuditPending } from "@/modules/audits/hooks";

export default function MonitoringPage() {
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects() });
  const pending = useAuditPending();
  const active = (projects.data ?? []).filter((p) => p.monitoring_enabled);

  return (
    <div className="space-y-6 p-8">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-brand-primary">Monitoreo</span>
        <h1 className="text-3xl font-semibold text-text-heading">Monitoreo constante</h1>
        <p className="text-sm text-text-body">Estado de proyectos con monitoreo activo y cola de auditorías.</p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-heading">Proyectos con monitoreo activo</h2>
          <span className="text-sm text-text-muted">{active.length} activos</span>
        </header>
        {active.length ? (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="min-w-full table-fixed text-sm">
              <thead className="bg-surface-subtle text-left font-medium text-text-body">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3">Última auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {active.map((p: Project) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-text-heading">{p.name}</td>
                    <td className="px-4 py-3">{p.primary_url}</td>
                    <td className="px-4 py-3">{p.schedule}</td>
                    <td className="px-4 py-3">{p.last_audit_at ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
            No hay proyectos activos. Activa el monitoreo desde Registro.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-heading">Auditorías en cola</h2>
          <span className="text-sm text-text-muted">{pending.data?.count ?? 0} en cola</span>
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
            No hay auditorías pendientes
          </div>
        )}
      </section>
    </div>
  );
}

