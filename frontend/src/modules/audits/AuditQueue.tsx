"use client";

import { useEffect, useMemo, useState } from "react";

type QueueItem = {
  id: string;
  project: string;
  type: string;
  status: string;
  startedAt: string;
  eta: string;
};

type ItemState = Omit<QueueItem, "status"> & {
  status: "En ejecucion" | "Pendiente" | "Completada" | "Fallida";
};

const statusStyles: Record<ItemState["status"], string> = {
  "En ejecucion": "border-emerald-200 bg-emerald-50 text-emerald-600",
  Pendiente: "border-border bg-surface text-text-body",
  Completada: "border-indigo-200 bg-indigo-50 text-indigo-600",
  Fallida: "border-rose-200 bg-rose-50 text-rose-600",
};

type Props = {
  items: QueueItem[];
  total: number;
  onRefresh?: () => void;
  isLoading?: boolean;
};

export function AuditQueue({ items, total, onRefresh, isLoading }: Props) {
  const [queue, setQueue] = useState<ItemState[]>(() => normalizeItems(items));

  useEffect(() => {
    setQueue(normalizeItems(items));
  }, [items]);

  const runningCount = useMemo(
    () => queue.filter((entry) => entry.status === "En ejecucion").length,
    [queue],
  );

  const handleStart = (id: string) => {
    setQueue((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "En ejecucion" as const,
              startedAt: "Ahora",
              eta: "00:10",
            }
          : item,
      ),
    );
  };

  const handleComplete = (id: string) => {
    setQueue((previous) =>
      previous
        .map((item) =>
          item.id === id
            ? {
                ...item,
                status: "Completada" as const,
                eta: "Finalizada",
              }
            : item,
        )
        .sort((a, b) => {
          if (a.status === b.status) return 0;
          if (a.status === "Completada") return 1;
          if (b.status === "Completada") return -1;
          return 0;
        }),
    );
  };

  const handleRetry = (id: string) => {
    setQueue((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "En ejecucion" as const,
              startedAt: "Ahora",
              eta: "00:12",
            }
          : item,
      ),
    );
  };

  if (!queue.length) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-surface-subtle p-6 text-center text-sm text-text-muted">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-text-heading">
            No hay auditorias en cola
          </h2>
          <p>
            Programa una nueva auditoria o sincroniza con el backend para ver ejecuciones
            recientes.
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-body transition hover:bg-surface"
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? "Actualizando..." : "Refrescar"}
            </button>
            <button
              type="button"
              className="rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-secondary"
              onClick={onRefresh}
              disabled={isLoading}
            >
              Programar auditoria
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-heading">
            Auditorias en cola
          </h2>
          <p className="text-xs text-text-body">
            {runningCount} en ejecucion, se procesan en paralelo por workers.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>
            Mostrando {queue.length} de {total}
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-full border border-border px-3 py-1 transition hover:bg-surface-alt disabled:opacity-60"
          >
            {isLoading ? "Actualizando..." : "Refrescar"}
          </button>
        </div>
        <button
          className="rounded-full border border-border px-3 py-1 text-xs text-text-body transition hover:bg-surface-alt"
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
        >
          Programar nueva
        </button>
      </header>
      <ul className="mt-4 space-y-3">
        {queue.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-subtle px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {item.project}
              </p>
              <span className="text-xs text-text-body">{item.type}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-body">
              <span
                className={`rounded-full border px-3 py-1 font-medium ${statusStyles[item.status]}`}
              >
                {item.status}
              </span>
              <span>Inicio: {item.startedAt}</span>
              <span>ETA: {item.eta}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              {item.status === "Pendiente" ? (
                <button
                  type="button"
                  onClick={() => handleStart(item.id)}
                  className="rounded-full border border-indigo-200 bg-surface px-3 py-1 text-indigo-500 transition hover:bg-indigo-50"
                >
                  Iniciar ahora
                </button>
              ) : null}
              {item.status === "En ejecucion" ? (
                <button
                  type="button"
                  onClick={() => handleComplete(item.id)}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-600 transition hover:bg-emerald-100"
                >
                  Marcar como lista
                </button>
              ) : null}
              {item.status === "Fallida" ? (
                <button
                  type="button"
                  onClick={() => handleRetry(item.id)}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-600 transition hover:bg-rose-100"
                >
                  Reintentar
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function normalizeItems(items: QueueItem[]): ItemState[] {
  return items.map((item) => ({
    ...item,
    status: (item.status as ItemState["status"]) ?? "Pendiente",
  }));
}
