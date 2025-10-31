"use client";

type ReportItem = {
  id: string;
  title: string;
  project: string;
  generatedAt: string;
  format: string;
  status: string;
};

export function ReportList({ reports }: { reports: ReportItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Reportes generados</h2>
        <button className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-100">
          Nuevo reporte
        </button>
      </header>
      <div className="mt-4 space-y-3">
        {reports.map((report) => (
          <article
            key={report.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">{report.title}</p>
              <span className="text-xs text-slate-500">{report.project}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>{report.generatedAt}</span>
              <span>{report.format}</span>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-medium text-indigo-600">
                {report.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
