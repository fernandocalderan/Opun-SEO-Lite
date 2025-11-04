import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { auditSummaryMock } from "../mocks/audits";

const auditSummarySchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  critical_issues: z.number().int().min(0),
  warnings: z.number().int().min(0),
  opportunities: z.number().int().min(0),
  last_run: z.string(),
});

export type AuditSummaryResponse = z.infer<typeof auditSummarySchema>;

export async function registerAuditRoutes(app: FastifyInstance) {
  app.get("/v1/audits/summary", async () => {
    return auditSummarySchema.parse(auditSummaryMock);
  });
}
