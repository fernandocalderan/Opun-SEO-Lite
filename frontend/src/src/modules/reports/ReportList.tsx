"use client";

import { useState } from "react";

type ReportItem = {
  id: string;
  title: string;
  project: string;
  generatedAt: string;
  format: string;
  status: string;
};

const statusBadge: Record<string, string> = {
  "Listo para compartir": "border-emerald-200 bg-emerald-50 text-emerald-600",
  "Requiere revision": "border-amber-200 bg-amber-50 text-amber-600",
  Compartido: "border-indigo-200 bg-indigo-50 text-indigo-600",
};

function createReportFile(report: ReportItem) {
  const content = `# ${report.title}
Proyecto: ${report.project}
Generado: ${report.generatedAt}
Formatos: ${report.format}
Estado actual: ${report.status}

Contenido mock del reporte...`;
  return new Blob([content], { type: "text/plain;charset=utf-8" });
}

export function ReportList({ reports }: { reports: ReportItem[] }) {
  const [list, setList] = useState(reports);

  const handleDownload = (report: ReportItem) => {
    const blob = createReportFile(report);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleMarkShared = (id: string) => {
    setList((previous) =>
      previous.map((report) =>
        report.id === id
          ? {
              ...report,
              status: "Compartido",
            }
          : report,
      ),
    );
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Reportes generados
          </h2>
          <p className="text-xs text-slate-500">
            Descarga o comparte entregables alineados con el mock de datos.
          </p>
        </div>
        <button className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-100">
          Nuevo reporte
        </button>
      </header>
      <div className="mt-4 space-y-3">
        {list.map((report) => (
          <article
            key={report.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {report.title}
              </p>
              <span className="text-xs text-slate-500">{report.project}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>{report.generatedAt}</span>
              <span>{report.format}</span>
              <span
                className={`rounded-full border px-3 py-1 font-medium ${
                  statusBadge[report.status] ?? "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {report.status}
              </span>
              <div className="flex items-center gap-2 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => handleDownload(report)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 transition hover:bg-slate-100"
                >
                  Descargar
                </button>
                {report.status !== "Compartido" ? (
                  <button
                    type="button"
                    onClick={() => handleMarkShared(report.id)}
                    className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-600 transition hover:bg-indigo-100"
                  >
                    Marcar compartido
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
