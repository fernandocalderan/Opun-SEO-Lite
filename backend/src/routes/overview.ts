import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { overviewMockResponse } from "../mocks/overview";

const overviewKpiSchema = z.object({
  label: z.string(),
  value: z.string(),
  delta: z.string(),
  status: z.enum(["good", "watch", "risk"]),
  description: z.string(),
});

const overviewAlertSchema = z.object({
  id: z.string(),
  channel: z.string(),
  source: z.string(),
  summary: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  published_at: z.string(),
  url: z.string().url(),
});

const overviewInsightSchema = z.object({
  title: z.string(),
  context: z.string(),
  recommendation: z.string(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  source: z.string(),
});

const overviewNarrativeSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  updated_at: z.string(),
});

export const overviewResponseSchema = z.object({
  kpis: z.array(overviewKpiSchema),
  alerts: z.array(overviewAlertSchema),
  insights: z.array(overviewInsightSchema),
  narrative: overviewNarrativeSchema,
});

export type OverviewResponse = z.infer<typeof overviewResponseSchema>;

export async function registerOverviewRoutes(app: FastifyInstance) {
  app.get("/v1/overview", async () => {
    return overviewResponseSchema.parse(overviewMockResponse);
  });
}
