"use client";

import { useMemo, useState } from "react";

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

const STATUS_ORDER = ["Pendiente", "En progreso", "Listo QA", "Completado"];

const parseDue = (value: string) => {
  const [day, month] = value.split(" ");
  const monthIndex = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].indexOf(
    month ?? "",
  );
  if (monthIndex === -1) {
    return new Date();
  }
  return new Date(new Date().getFullYear(), monthIndex, Number.parseInt(day ?? "1", 10));
};

function downloadJson(rows: PlanRow[], filename: string) {
  const blob = new Blob([JSON.stringify(rows, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function PlanTable({ rows }: { rows: PlanRow[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [ownerFilter, setOwnerFilter] = useState<string>("Todos");
  const [search, setSearch] = useState<string>("");
  const [sortByDue, setSortByDue] = useState<boolean>(true);

  const owners = useMemo(
    () => ["Todos", ...Array.from(new Set(rows.map((row) => row.owner)))],
    [rows],
  );

  const statuses = useMemo(
    () => ["Todos", ...Array.from(new Set(rows.map((row) => row.status)))],
    [rows],
  );

  const filteredRows = useMemo(() => {
    const normalized = rows.filter((row) => {
      const matchStatus =
        statusFilter === "Todos" ? true : row.status === statusFilter;
      const matchOwner =
        ownerFilter === "Todos" ? true : row.owner === ownerFilter;
      const matchSearch =
        search.trim().length === 0
          ? true
          : [row.task.toLowerCase(), row.category.toLowerCase()].some((value) =>
              value.includes(search.toLowerCase()),
            );

      return matchStatus && matchOwner && matchSearch;
    });

    const ordered = normalized.sort((a, b) => {
      if (sortByDue) {
        return parseDue(a.due).getTime() - parseDue(b.due).getTime();
      }
      return (
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
      );
    });

    return ordered;
  }, [rows, statusFilter, ownerFilter, search, sortByDue]);

  const handleExport = () => {
    downloadJson(filteredRows, "opun-plan.json");
  };

  const handleShare = () => {
    const payload = {
      filters: { statusFilter, ownerFilter, search },
      items: filteredRows,
    };
    const shareUrl = `https://opun.app/share?payload=${encodeURIComponent(
      btoa(JSON.stringify(payload)),
    )}`;
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-heading">Plan maestro</h2>
          <p className="text-xs text-text-body">
            Filtra acciones por estado, owner o palabra clave.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-body">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-full border border-border px-3 py-1 hover:bg-surface-alt"
          >
            Exportar JSON
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="rounded-full border border-border px-3 py-1 hover:bg-surface-alt"
          >
            Copiar enlace
          </button>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
        <label className="flex items-center gap-2 text-text-body">
          Estado
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-border bg-surface px-2 py-1 text-xs"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-text-body">
          Owner
          <select
            value={ownerFilter}
            onChange={(event) => setOwnerFilter(event.target.value)}
            className="rounded-lg border border-border bg-surface px-2 py-1 text-xs"
          >
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-text-body">
          Buscar
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ej: canonical"
            className="rounded-lg border border-border bg-surface px-3 py-1 text-xs"
          />
        </label>
        <button
          type="button"
          onClick={() => setSortByDue((previous) => !previous)}
          className="rounded-full border border-border px-3 py-1 text-xs text-text-body transition hover:bg-surface-alt"
        >
          Orden: {sortByDue ? "Due date" : "Estado"}
        </button>
        <span className="text-text-muted">
          {filteredRows.length} resultados visibles
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-surface-subtle text-left font-medium text-text-body">
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
            {filteredRows.map((row) => (
              <tr key={row.id} className="bg-surface">
                <td className="px-4 py-3 text-text-body">{row.category}</td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {row.task}
                </td>
                <td className="px-4 py-3 text-text-body">{row.impact}</td>
                <td className="px-4 py-3 text-text-body">{row.effort}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-medium text-text-body">
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-body">{row.owner}</td>
                <td className="px-4 py-3 text-text-body">{row.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
