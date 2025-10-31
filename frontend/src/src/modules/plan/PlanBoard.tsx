"use client";

type PlanCard = {
  id: string;
  title: string;
  impact: string;
  effort: string;
  owner: string;
  due: string;
};

type Column = {
  title: string;
  items: PlanCard[];
};

export function PlanBoard({ columns }: { columns: Column[] }) {
  return (
    <section className="grid gap-4 lg:grid-cols-4">
      {columns.map((column) => (
        <article
          key={column.title}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">{column.title}</h3>
            <span className="text-xs text-slate-400">{column.items.length}</span>
          </header>
          <div className="space-y-3">
            {column.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm shadow-inner"
              >
                <p className="font-medium text-slate-800">{item.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600">
                    Impacto {item.impact}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">
                    Esfuerzo {item.effort}
                  </span>
                  <span>Owner: {item.owner}</span>
                  <span>Due: {item.due}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
