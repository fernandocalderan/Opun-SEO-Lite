import { AuditHistory } from "@/modules/audits/AuditHistory";
import { AuditPerformance } from "@/modules/audits/AuditPerformance";
import { AuditQueue } from "@/modules/audits/AuditQueue";
import { AuditSummarySection } from "@/modules/audits/AuditSummarySection";
import { auditHistory, auditQueue } from "@/lib/mocks";

export default function AuditsPage() {
  return (
    <div className="space-y-6 p-8">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-brand-primary">
          Audit Orchestrator
        </span>
        <h1 className="text-3xl font-semibold text-text-heading">
          Estado de auditorias y backlog
        </h1>
        <p className="text-sm text-text-body">
          Controla ejecuciones en curso, prioriza el backlog y comparte resultados con los squads.
        </p>
      </header>

      <AuditSummarySection />
      <AuditPerformance history={auditHistory} />

      <div className="grid gap-6 xl:grid-cols-2">
        <AuditQueue items={auditQueue} />
        <AuditHistory items={auditHistory} />
      </div>
    </div>
  );
}
