"use client";

type Props = {
  id: string;
  html?: string;
  onClose: () => void;
};

export function ReportResultModal({ id, html, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
      <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
        <header className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-base font-semibold text-text-heading">Reporte · {id}</h3>
          <button onClick={onClose} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-body hover:bg-surface-subtle">Cerrar</button>
        </header>
        <div className="max-h-[70vh] overflow-auto bg-white p-0">
          {html ? (
            <iframe title={`report-${id}`} srcDoc={html} className="h-[70vh] w-full" />
          ) : (
            <p className="p-4 text-sm text-text-muted">Generando reporte...</p>
          )}
        </div>
      </div>
    </div>
  );
}

