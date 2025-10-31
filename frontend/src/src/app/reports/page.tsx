import { ReportList } from "@/modules/reports/ReportList";
import { TemplateLibrary } from "@/modules/reports/TemplateLibrary";
import { reportList, templateLibrary } from "@/lib/mocks/reports";

export default function ReportsPage() {
  return (
    <div className="space-y-6 p-8">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
          Report Builder
        </span>
        <h1 className="text-3xl font-semibold text-slate-900">
          Entregables y templates
        </h1>
        <p className="text-sm text-slate-500">
          Mantiene reportes actualizados y plantillas reutilizables para clientes y stakeholders.
        </p>
      </header>

      <ReportList reports={reportList} />
      <TemplateLibrary templates={templateLibrary} />
    </div>
  );
}
