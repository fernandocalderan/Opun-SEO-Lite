"use client";

type HistoryItem = {
  id: string;
  project: string;
  finishedAt: string;
  score: number;
  criticalIssues: number;
  owner: string;
};

type Props = {
  items: HistoryItem[];
  total: number;
  onRefresh?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  onViewResult?: (id: string) => void;
};

export function AuditHistory({
  items,
  total,
  onRefresh,
  isLoading,
  hasMore,
  onLoadMore,
  isLoadingMore,
  onViewResult,
}: Props) {
  if (!items.length) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-surface-subtle p-6 text-center text-sm text-text-muted">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-text-heading">
            No hay ejecuciones recientes
          </h2>
          <p>
            Ejecuta una auditoria o sincroniza tus proyectos para ver el historial. Para ver resultados completos, abre la vista SEO.
          </p>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-body transition hover:bg-surface disabled:opacity-60"
          >
            {isLoading ? "Actualizando..." : "Refrescar"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-heading">Historial reciente</h2>
          <p className="text-xs text-text-muted">
            Mostrando {items.length} de {total} auditorias.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-body transition hover:bg-surface-alt disabled:opacity-60"
        >
          {isLoading ? "Actualizando..." : "Refrescar"}
        </button>
      </header>
      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <table className="min-w-full table-fixed divide-y divide-slate-200 text-sm">
          <thead className="bg-surface-subtle text-left font-medium text-text-body">
            <tr>
              <th className="w-2/5 px-4 py-3">Proyecto</th>
              <th className="px-4 py-3">Finalizado</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Issues</th>
              <th className="px-4 py-3">Owner</th>
              <th className="w-32 px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="bg-surface">
                <td className="px-4 py-3 font-medium text-slate-800">
                  <span className="block max-w-[40ch] truncate" title={item.project}>{item.project}</span>
                </td>
                <td className="px-4 py-3 text-text-body">{item.finishedAt}</td>
                <td className="px-4 py-3 text-text-body">{item.score}</td>
                <td className="px-4 py-3 text-text-body">{item.criticalIssues}</td>
                <td className="px-4 py-3 text-text-body">{item.owner}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onViewResult?.(item.id)}
                    className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs font-medium text-text-body transition hover:bg-surface-alt"
                  >
                    Abrir en SEO
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text-body transition hover:bg-surface-alt disabled:opacity-60"
          >
            {isLoadingMore ? "Cargando..." : "Cargar más"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
