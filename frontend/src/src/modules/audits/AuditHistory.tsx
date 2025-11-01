"use client";

type HistoryItem = {
  id: string;
  project: string;
  finishedAt: string;
  score: number;
  criticalIssues: number;
  owner: string;
};

export function AuditHistory({ items }: { items: HistoryItem[] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-heading">Historial reciente</h2>
        <a
          href="#"
          className="text-xs font-medium text-indigo-500 hover:text-indigo-600"
        >
          Ver todo
        </a>
      </header>
      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-surface-subtle text-left font-medium text-text-body">
            <tr>
              <th className="px-4 py-3">Proyecto</th>
              <th className="px-4 py-3">Finalizado</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Issues</th>
              <th className="px-4 py-3">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="bg-surface">
                <td className="px-4 py-3 font-medium text-slate-800">
                  {item.project}
                </td>
                <td className="px-4 py-3 text-text-body">{item.finishedAt}</td>
                <td className="px-4 py-3 text-text-body">{item.score}</td>
                <td className="px-4 py-3 text-text-body">{item.criticalIssues}</td>
                <td className="px-4 py-3 text-text-body">{item.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
