"use client";

import { useMemo, useState } from "react";

type QueueItem = {
  id: string;
  project: string;
  type: string;
  status: string;
  startedAt: string;
  eta: string;
};

type ItemState = Omit<QueueItem, "status"> & {
  status: "En ejecucion" | "Pendiente" | "Completada";
};

export function AuditQueue({ items }: { items: QueueItem[] }) {
  const [queue, setQueue] = useState<ItemState[]>(
    items.map((item) => ({
      ...item,
      status: item.status as ItemState["status"],
    })),
  );

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
        <button className="rounded-full border border-border px-3 py-1 text-xs text-text-body transition hover:bg-surface-alt">
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
                className={`rounded-full border px-3 py-1 font-medium ${
                  item.status === "En ejecucion"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : item.status === "Pendiente"
                      ? "border-border bg-surface text-text-body"
                      : "border-indigo-200 bg-indigo-50 text-indigo-600"
                }`}
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
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
