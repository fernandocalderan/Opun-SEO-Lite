"use client";

type PlanRow = {
  id: string;
  category: string;
  task: string;
  impact: string;
  effort: string;
  status: string;
  owner: string;
  due: string;
};

export function PlanTable({ rows }: { rows: PlanRow[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Plan maestro</h2>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-100">
            Exportar Notion
          </button>
          <button className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-100">
            Compartir enlace
          </button>
        </div>
      </header>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left font-medium text-slate-500">
            <tr>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Tarea</th>
              <th className="px-4 py-3">Impacto</th>
              <th className="px-4 py-3">Esfuerzo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="px-4 py-3 text-slate-500">{row.category}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{row.task}</td>
                <td className="px-4 py-3 text-slate-600">{row.impact}</td>
                <td className="px-4 py-3 text-slate-600">{row.effort}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{row.owner}</td>
                <td className="px-4 py-3 text-slate-500">{row.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
