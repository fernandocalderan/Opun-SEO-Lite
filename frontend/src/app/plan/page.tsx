import { PlanBoard } from "@/modules/plan/PlanBoard";
import { PlanTable } from "@/modules/plan/PlanTable";
import { PlanVelocityChart } from "@/modules/plan/PlanVelocityChart";
import { usePlanBoard, usePlanTable, usePlanVelocity } from "@/modules/plan/hooks";

export default function PlanPage() {
  const board = usePlanBoard();
  const velocity = usePlanVelocity();
  const table = usePlanTable();
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
      <PlanBoard columns={board.data ?? []} />
      <PlanVelocityChart data={velocity.data ?? []} />
      <PlanTable rows={table.data ?? []} />
    </div>
  );
}
