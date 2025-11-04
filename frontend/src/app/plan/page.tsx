"use client";

import { PlanBoard } from "@/modules/plan/PlanBoard";
import { PlanTable } from "@/modules/plan/PlanTable";
import { PlanVelocityChart } from "@/modules/plan/PlanVelocityChart";
import { usePlanBoard, usePlanTable, usePlanVelocity } from "@/modules/plan/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlanItem, deletePlanItem, updatePlanItem } from "@/lib/gateways/plan";

export default function PlanPage() {
  const board = usePlanBoard();
  const velocity = usePlanVelocity();
  const table = usePlanTable();
  const qc = useQueryClient();

  const mAdd = useMutation({
    mutationFn: (payload: { column: string; title: string }) =>
      createPlanItem(payload.column, {
        title: payload.title,
        impact: "Medio",
        effort: "Bajo",
        owner: "SEO Ops",
        due: new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(new Date()),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan","board"] });
      qc.invalidateQueries({ queryKey: ["plan","table"] });
    },
  });

  const mMove = useMutation({
    mutationFn: ({ id, to }: { id: string; to: string }) => updatePlanItem(id, { column: to }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plan","board"] }),
  });

  const mDelete = useMutation({
    mutationFn: (id: string) => deletePlanItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan","board"] });
      qc.invalidateQueries({ queryKey: ["plan","table"] });
    },
  });
  return (
    <div className="space-y-6 p-8">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-brand-primary">
          Action Planner
        </span>
        <h1 className="text-3xl font-semibold text-text-heading">
          Priorizacion y seguimiento
        </h1>
        <p className="text-sm text-text-body">
          Coordina iniciativas de SEO y reputacion entre equipos cross-funcionales.
        </p>
      </header>
      <PlanActions onAdd={(title, column) => mAdd.mutate({ title, column })} isAdding={mAdd.isPending} />
      <PlanBoard
        columns={board.data ?? []}
        onMoveCard={(id, to) => mMove.mutate({ id, to })}
        onDeleteCard={(id) => mDelete.mutate(id)}
      />
      <PlanVelocityChart data={velocity.data ?? []} />
      <PlanTable rows={table.data ?? []} />
    </div>
  );
}

function PlanActions({ onAdd, isAdding }: { onAdd: (title: string, column: string) => void; isAdding: boolean }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <form
        className="flex flex-wrap items-center gap-3 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
          const column = (form.elements.namedItem("column") as HTMLSelectElement).value;
          if (title) onAdd(title, column);
          (form.elements.namedItem("title") as HTMLInputElement).value = "";
        }}
      >
        <input name="title" placeholder="Nueva tarea..." className="min-w-64 flex-1 rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-brand-primary" />
        <select name="column" className="rounded-lg border border-border bg-surface px-2 py-2">
          <option>Pendiente</option>
          <option>En progreso</option>
          <option>Listo para QA</option>
        </select>
        <button type="submit" disabled={isAdding} className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {isAdding ? "Agregando..." : "Añadir"}
        </button>
      </form>
    </section>
  );
}
