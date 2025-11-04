"use client";

import { ReportActivityChart } from "@/modules/reports/ReportActivityChart";
import { ReportList } from "@/modules/reports/ReportList";
import { TemplateLibrary } from "@/modules/reports/TemplateLibrary";
import { useReportActivity, useReportList, useReportTemplates } from "@/modules/reports/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReport, fetchReportResult } from "@/lib/gateways/reports";
import { useEffect, useRef, useState } from "react";
import { ReportResultModal } from "@/modules/reports/ReportResultModal";

export default function ReportsPage() {
  const list = useReportList();
  const templates = useReportTemplates();
  const activity = useReportActivity();
  const qc = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [html, setHtml] = useState<string | undefined>();
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const mGen = useMutation({
    mutationFn: (payload: { title: string; project: string }) => createReport(payload),
    onSuccess: async (res) => {
      if (!res) return;
      setOpenId(res.id);
      setHtml(undefined);
      // poll until ready
      const tryFetch = async () => {
        const r = await fetchReportResult(res.id);
        if (r && !("status" in (r as any))) {
          setHtml((r as any).html);
          qc.invalidateQueries({ queryKey: ["reports","list"] });
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        }
      };
      pollRef.current = setInterval(tryFetch, 2000);
      await tryFetch();
    },
  });
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);
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

      <section className="rounded-2xl border border-border bg-surface p-4">
        <form
          className="flex flex-wrap items-center gap-3 text-sm"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim() || `Executive Brief ${new Date().toLocaleDateString("es-ES")}`;
            const project = (form.elements.namedItem("project") as HTMLInputElement).value.trim() || "Brand HQ";
            mGen.mutate({ title, project });
          }}
        >
          <input name="title" placeholder="Titulo del reporte (opcional)" className="min-w-64 flex-1 rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-brand-primary" />
          <input name="project" placeholder="Proyecto (opcional)" className="min-w-64 rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-brand-primary" />
          <button type="submit" disabled={mGen.isPending} className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {mGen.isPending ? "Generando..." : "Generar reporte"}
          </button>
        </form>
      </section>

      <ReportActivityChart data={activity.data ?? []} />
      <ReportList reports={list.data ?? []} />
      <TemplateLibrary templates={templates.data ?? []} />
      {openId ? (
        <ReportResultModal id={openId} html={html} onClose={() => { setOpenId(null); setHtml(undefined); }} />
      ) : null}
    </div>
  );
}
