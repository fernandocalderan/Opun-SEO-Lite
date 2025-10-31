import { planColumns, planTable, planVelocity } from "@/lib/mocks/plan";
import { PlanBoard } from "@/modules/plan/PlanBoard";
import { PlanTable } from "@/modules/plan/PlanTable";
import { PlanVelocityChart } from "@/modules/plan/PlanVelocityChart";

export default function PlanPage() {
  return (
    <div className="space-y-6 p-8">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
          Action Planner
        </span>
        <h1 className="text-3xl font-semibold text-slate-900">
          Priorizacion y seguimiento
        </h1>
        <p className="text-sm text-slate-500">
          Coordina iniciativas de SEO y reputacion entre equipos cross-funcionales.
        </p>
      </header>
      <PlanBoard columns={planColumns} />
      <PlanVelocityChart data={planVelocity} />
      <PlanTable rows={planTable} />
    </div>
  );
}
