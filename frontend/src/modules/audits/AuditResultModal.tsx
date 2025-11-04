"use client";

import { useEffect } from "react";
import { AuditResultView } from "./AuditResultView";

type Props = {
  id: string;
  content: any | { status: "pending" } | null;
  onClose: () => void;
};

export function AuditResultModal({ id, content, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
      <div className="w-full max-w-4xl rounded-xl border border-border bg-surface shadow-lg">
        <header className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-base font-semibold text-text-heading">Resultado de auditoria · {id}</h3>
          <div className="flex items-center gap-2">
            {content && !("status" in (content as any)) ? (
              <button
                onClick={() => downloadJson(id, content)}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-body hover:bg-surface-subtle"
              >
                Descargar JSON
              </button>
            ) : null}
            <button onClick={onClose} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-body hover:bg-surface-subtle">
              Cerrar
            </button>
          </div>
        </header>
        <div className="max-h-[70vh] overflow-auto p-4 text-sm">
          {content == null ? (
            <p className="text-text-muted">Cargando...</p>
          ) : "status" in (content as any) && (content as any).status === "pending" ? (
            <p className="text-text-muted">El resultado aún no está listo. Intentando nuevamente...</p>
          ) : (
            <AuditResultView result={content as any} />
          )}
        </div>
      </div>
    </div>
  );
}

function downloadJson(id: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-${id}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
