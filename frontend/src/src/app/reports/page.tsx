import { reportActivity, reportList, templateLibrary } from "@/lib/mocks";
import { ReportActivityChart } from "@/modules/reports/ReportActivityChart";
import { ReportList } from "@/modules/reports/ReportList";
import { TemplateLibrary } from "@/modules/reports/TemplateLibrary";

export default function ReportsPage() {
  return (
    <div className="space-y-6 p-8">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-brand-primary">
          Report Builder
        </span>
        <h1 className="text-3xl font-semibold text-text-heading">
          Entregables y templates
        </h1>
        <p className="text-sm text-text-body">
          Mantiene reportes actualizados y plantillas reutilizables para clientes y stakeholders.
        </p>
      </header>

      <ReportActivityChart data={reportActivity} />
      <ReportList reports={reportList} />
      <TemplateLibrary templates={templateLibrary} />
    </div>
  );
}
