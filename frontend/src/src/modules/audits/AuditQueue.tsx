"use client";

type QueueItem = {
  id: string;
  project: string;
  type: string;
  status: string;
  startedAt: string;
  eta: string;
};

export function AuditQueue({ items }: { items: QueueItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Auditorias en cola</h2>
        <button className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:bg-slate-100">
          Programar nueva
        </button>
      </header>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">{item.project}</p>
              <span className="text-xs text-slate-500">{item.type}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-medium text-indigo-600">
                {item.status}
              </span>
              <span>Inicio: {item.startedAt}</span>
              <span>ETA: {item.eta}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
