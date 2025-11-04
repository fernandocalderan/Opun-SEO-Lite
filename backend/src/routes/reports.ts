import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getReportActivity, getReportTemplates, getReportsList } from "../store/reportsStore";

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
}

