import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  auditHistoryMock,
  auditPerformanceMock,
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
  total: z.number().int().min(0),
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
  total: z.number().int().min(0),
});

const auditPerformancePointSchema = z.object({
  id: z.string(),
  project: z.string(),
  completed_at: z.string(),
  score: z.number().int().min(0).max(100),
  critical_issues: z.number().int().min(0),
  duration_seconds: z.number().int().min(0),
});

const auditPerformanceResponseSchema = z.object({
  points: z.array(auditPerformancePointSchema),
  aggregates: z.object({
    average_score: z.number(),
    average_duration_seconds: z.number(),
    max_duration_seconds: z.number(),
    sample_size: z.number().int().min(0),
    duration_distribution: z.array(
      z.object({
        label: z.string(),
        count: z.number().int().min(0),
      }),
    ),
  }),
});

const auditPendingResponseSchema = z.object({
  items: z.array(auditQueueItemSchema),
  count: z.number().int().min(0),
});

export async function registerAuditRoutes(app: FastifyInstance) {
  app.get("/v1/audits/summary", async () => {
    return auditSummarySchema.parse(auditSummaryMock);
  });

  app.get("/v1/audits/queue", async (request) => {
    const { limit = "3", cursor } = request.query as {
      limit?: string;
      cursor?: string;
    };

    const pageSize = clamp(Number.parseInt(limit ?? "3", 10), 1, 10);
    const startIndex = decodeCursor(cursor);
    const endIndex = startIndex + pageSize;

    const items = auditQueueMock.slice(startIndex, endIndex);
    const nextCursor = endIndex < auditQueueMock.length ? encodeCursor(endIndex) : null;

    return auditQueueResponseSchema.parse({
      items,
      next_cursor: nextCursor,
      total: auditQueueMock.length,
    });
  });

  app.get("/v1/audits/history", async (request) => {
    const { limit = "5", cursor } = request.query as {
      limit?: string;
      cursor?: string;
    };

    const pageSize = clamp(Number.parseInt(limit ?? "5", 10), 1, 20);
    const startIndex = decodeCursor(cursor);
    const endIndex = startIndex + pageSize;

    const items = auditHistoryMock.slice(startIndex, endIndex);
    const nextCursor =
      endIndex < auditHistoryMock.length ? encodeCursor(endIndex) : null;

    return auditHistoryResponseSchema.parse({
      items,
      next_cursor: nextCursor,
      total: auditHistoryMock.length,
    });
  });

  app.get("/v1/audits/performance", async () => {
    const aggregates = computePerformanceAggregates();

    return auditPerformanceResponseSchema.parse({
      points: auditPerformanceMock,
      aggregates,
    });
  });

  app.get("/v1/audits/pending", async () => {
    const items = auditQueueMock.filter((item) => item.status === "pending");
    return auditPendingResponseSchema.parse({
      items,
      count: items.length,
    });
  });
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

function decodeCursor(cursor?: string | null) {
  if (!cursor) {
    return 0;
  }
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const index = Number.parseInt(decoded, 10);
    return Number.isNaN(index) || index < 0 ? 0 : index;
  } catch {
    return 0;
  }
}

function encodeCursor(index: number) {
  return Buffer.from(String(index)).toString("base64url");
}

function computePerformanceAggregates() {
  if (auditPerformanceMock.length === 0) {
    return {
      average_score: 0,
      average_duration_seconds: 0,
      max_duration_seconds: 0,
      sample_size: 0,
      duration_distribution: [],
    };
  }

  const totalScore = auditPerformanceMock.reduce((acc, point) => acc + point.score, 0);
  const totalDuration = auditPerformanceMock.reduce(
    (acc, point) => acc + point.duration_seconds,
    0,
  );
  const maxDuration = auditPerformanceMock.reduce(
    (max, point) => Math.max(max, point.duration_seconds),
    0,
  );

  return {
    average_score: totalScore / auditPerformanceMock.length,
    average_duration_seconds: totalDuration / auditPerformanceMock.length,
    max_duration_seconds: maxDuration,
    sample_size: auditPerformanceMock.length,
    duration_distribution: computeDurationDistribution(),
  };
}

function computeDurationDistribution() {
  const buckets = [
    { label: "<5m", min: 0, max: 300 },
    { label: "5-10m", min: 300, max: 600 },
    { label: "10-15m", min: 600, max: 900 },
    { label: ">15m", min: 900, max: Infinity },
  ];

  return buckets.map((bucket) => ({
    label: bucket.label,
    count: auditPerformanceMock.filter((point) => {
      const duration = point.duration_seconds;
      return duration >= bucket.min && duration < bucket.max;
    }).length,
  }));
}
