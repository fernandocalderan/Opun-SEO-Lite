import { AuditPerformance } from "@/modules/audits/AuditPerformance";
import { AuditSummarySection } from "@/modules/audits/AuditSummarySection";
import { AuditQueueSection } from "@/modules/audits/AuditQueueSection";
import { AuditHistorySection } from "@/modules/audits/AuditHistorySection";
import { auditHistory } from "@/lib/mocks";

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
        <AuditQueueSection />
        <AuditHistorySection />
      </div>
    </div>
  );
}
