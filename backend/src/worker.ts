import { setTimeout as sleep } from "node:timers/promises";
import { createAudit, getPendingQueue, markCompleted, markFailed, markRunning } from "./store/auditsStore";
import { getSchedulableProjects, markProjectAudited } from "./store/projectsStore";
import { getPendingReports, markReportCompleted, markReportFailed, markReportRunning } from "./store/reportsStore";
import { analyzeCrawl, analyzePerformance, analyzeSeoMeta, analyzeSocial, computeScores, fetchSerp, generateExecutiveSummary, type AuditFullResult } from "./analyzers/web";

async function processPendingOnce() {
  const pending = await getPendingQueue();
  if (pending.length === 0) {
    console.log("No pending audits.");
    return;
  }

  for (const item of pending) {
    try {
      const eta = Math.floor(Math.random() * 10) * 30 + 60; // 60-360s
      await markRunning(item.id, eta);
      console.log(`Running ${item.id} (${item.project}) ~${eta}s`);
      // V0/V1: realizar auditorías ligeras reales (con tiempo acotado)
      const url = item.url || item.project; // URL objetivo
      const kw: string[] = Array.isArray(item.keywords) ? item.keywords : [];

      const [seo_meta, crawl, perf, social] = await Promise.all([
        analyzeSeoMeta(url, kw).catch((e) => ({ status: "error", error: String(e) } as any)),
        analyzeCrawl(url).catch((e) => ({ status: "error", error: String(e) } as any)),
        analyzePerformance(url).catch((e) => ({ status: "error", error: String(e) } as any)),
        analyzeSocial(url, kw).catch((e) => ({ status: "error", error: String(e) } as any)),
      ]);

      // V2: SERP opcional si hay clave
      const serp = process.env.SERPAPI_KEY ? await fetchSerp(url, kw).catch(() => []) : [];

      const scores = computeScores({ seo_meta, crawl_indexability: crawl, performance: perf, social });

      const full: AuditFullResult = {
        seo_meta: seo_meta as any,
        crawl_indexability: crawl as any,
        performance: perf as any,
        social: social as any,
        serp,
        scores,
      };

      // Executive summary via OpenAI (optional)
      const summary = await generateExecutiveSummary(full).catch(() => undefined);
      if (summary) {
        full.executive_summary = summary;
      }

      // Simular espera corta para UX
      await sleep(1000);

      const score = scores.overall ?? 75;
      const critical_issues = Math.floor(Math.random() * 6); // placeholder
      const duration_seconds = Math.max(60, Math.min(360, eta));
      await markCompleted(item.id, { score, critical_issues, duration_seconds }, full);
      console.log(`Completed ${item.id}`);
    } catch (error) {
      console.error(`Failed ${item.id}`, error);
      await markFailed(item.id, (error as Error).message);
    }
  }
}

async function processReportsOnce() {
  const pending = await getPendingReports();
  if (pending.length === 0) {
    return;
  }
  for (const item of pending) {
    try {
      const eta = Math.floor(Math.random() * 6) + 3; // 3-8s
      await markReportRunning(item.id, eta);
      console.log(`Generating report ${item.id} (${item.title}) ~${eta}s`);
      await sleep(eta * 1000);
      const now = new Date().toISOString();
      const html = `<!doctype html><meta charset="utf-8"><title>${item.title}</title><h1>${item.title}</h1><p>Proyecto: <strong>${item.project}</strong></p><p>Generado: ${now}</p><hr/><p>Resumen ejecutivo: ver módulo de auditorías y KPIs.</p>`;
      await markReportCompleted(item.id, html, "HTML");
      console.log(`Report completed ${item.id}`);
    } catch (err) {
      console.error(`Report failed ${item.id}`, err);
      await markReportFailed(item.id, (err as Error).message);
    }
  }
}

async function main() {
  const mode = process.env.WORKER_MODE ?? "once";
  if (mode === "loop") {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // schedule audits for projects based on cadence
      const sched = await getSchedulableProjects();
      for (const p of sched) {
        try {
          await createAudit({ project: p.name || p.primary_url, type: "standard", url: p.primary_url, keywords: p.keywords });
          await markProjectAudited(p.id);
          console.log(`Scheduled audit for project ${p.name}`);
        } catch (e) {
          console.error("Failed to schedule audit", e);
        }
      }
      await processPendingOnce();
      await processReportsOnce();
      await sleep(5000);
    }
  } else {
    // one-shot scheduling
    const sched = await getSchedulableProjects();
    for (const p of sched) {
      await createAudit({ project: p.name || p.primary_url, type: "standard", url: p.primary_url, keywords: p.keywords });
      await markProjectAudited(p.id);
    }
    await processPendingOnce();
    await processReportsOnce();
  }
}

// Run when invoked directly
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
