import { AuditHistory } from "@/modules/audits/AuditHistory";
import { AuditPerformance } from "@/modules/audits/AuditPerformance";
import { AuditQueue } from "@/modules/audits/AuditQueue";
import { AuditSummary } from "@/modules/audits/AuditSummary";
import { auditHistory, auditQueue, auditSummary } from "@/lib/mocks/audits";

export default function AuditsPage() {
  return (
    <div className="space-y-6 p-8">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
          Audit Orchestrator
        </span>
        <h1 className="text-3xl font-semibold text-slate-900">
          Estado de auditorias y backlog
        </h1>
        <p className="text-sm text-slate-500">
          Controla ejecuciones en curso, prioriza el backlog y comparte resultados con los squads.
        </p>
      </header>

      <AuditSummary items={auditSummary} />
      <AuditPerformance history={auditHistory} />

      <div className="grid gap-6 xl:grid-cols-2">
        <AuditQueue items={auditQueue} />
        <AuditHistory items={auditHistory} />
      </div>
    </div>
  );
}
