import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  auditHistoryMock,
  auditQueueMock,
  auditSummaryMock,
} from "../mocks/audits";

const auditSummarySchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  critical_issues: z.number().int().min(0),
  warnings: z.number().int().min(0),
  opportunities: z.number().int().min(0),
  last_run: z.string(),
});

export type AuditSummaryResponse = z.infer<typeof auditSummarySchema>;

const auditQueueItemSchema = z.object({
  id: z.string(),
  project: z.string(),
  type: z.string(),
  status: z.enum(["running", "pending", "completed", "failed"]),
  started_at: z.string().nullable(),
  eta_seconds: z.number().int().nullable(),
});

const auditQueueResponseSchema = z.object({
  items: z.array(auditQueueItemSchema),
  next_cursor: z.string().nullable(),
});

const auditHistoryItemSchema = z.object({
  id: z.string(),
  project: z.string(),
  completed_at: z.string(),
  score: z.number().int().min(0).max(100),
  critical_issues: z.number().int().min(0),
  owner: z.string(),
});

const auditHistoryResponseSchema = z.object({
  items: z.array(auditHistoryItemSchema),
  next_cursor: z.string().nullable(),
});

export async function registerAuditRoutes(app: FastifyInstance) {
  app.get("/v1/audits/summary", async () => {
    return auditSummarySchema.parse(auditSummaryMock);
  });

  app.get("/v1/audits/queue", async () => {
    return auditQueueResponseSchema.parse({
      items: auditQueueMock,
      next_cursor: null,
    });
  });

  app.get("/v1/audits/history", async () => {
    return auditHistoryResponseSchema.parse({
      items: auditHistoryMock,
      next_cursor: null,
    });
  });
}
