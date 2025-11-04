import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createReport, getReportActivity, getReportResult, getReportStatus, getReportTemplates, getReportsList } from "../store/reportsStore";

export async function registerReportsRoutes(app: FastifyInstance) {
  app.get("/v1/reports/list", async () => {
    const items = await getReportsList();
    return z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          project: z.string(),
          generated_at: z.string(),
          format: z.string(),
          status: z.string(),
        }),
      )
      .parse(items);
  });

  app.get("/v1/reports/templates", async () => {
    const items = await getReportTemplates();
    return z.array(z.object({ id: z.string(), name: z.string(), description: z.string() })).parse(items);
  });

  app.get("/v1/reports/activity", async () => {
    const items = await getReportActivity();
    return z.array(z.object({ date: z.string(), generated: z.number(), shared: z.number() })).parse(items);
  });

  app.post("/v1/reports", async (request) => {
    const body = z.object({ title: z.string(), project: z.string(), format: z.string().optional() }).parse(request.body);
    const created = await createReport(body);
    return { id: created.id, status: "pending" as const };
  });

  app.get("/v1/reports/:id/status", async (request, reply) => {
    const { id } = request.params as { id: string };
    const s = await getReportStatus(id);
    if (!s) return reply.code(404).send({ error: "Not found" });
    return s;
  });

  app.get("/v1/reports/:id/result", async (request, reply) => {
    const { id } = request.params as { id: string };
    const res = await getReportResult(id);
    if (!res) return reply.code(202).send({ status: "pending" });
    return res;
  });
}
