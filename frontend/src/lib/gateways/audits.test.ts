import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAuditHistoryFallback,
  createAuditPerformanceFallback,
  createAuditQueueFallback,
  createAuditSummaryFallback,
  createPendingAuditsFallback,
  fetchAuditHistory,
  fetchAuditPerformance,
  fetchAuditQueue,
  fetchAuditSummary,
  fetchPendingAudits,
  type AuditHistoryResponse,
  type AuditPerformanceResponse,
  type AuditQueueResponse,
  type AuditSummaryResponse,
} from "./audits";

const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

describe("audits gateways", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
  });

  describe("fetchAuditSummary", () => {
    it("retorna tarjetas mapeadas desde la API", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
      const mockResponse: AuditSummaryResponse = {
        overall_score: 88,
        critical_issues: 2,
        warnings: 5,
        opportunities: 3,
        last_run: "2025-11-03T12:00:00Z",
      };

      vi.setSystemTime(new Date("2025-11-04T12:00:00Z"));

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchAuditSummary();

      expect(result).toHaveLength(3);
      expect(result[0].label).toBe("Score global");
      expect(result[0].value).toBe("88 / 100");
      expect(result[0].status).toBe("good");
    });

    it("usa fallback cuando la peticion falla", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchAuditSummary();

      expect(result).toEqual(createAuditSummaryFallback());
    });
  });

  describe("fetchAuditQueue", () => {
    it("transforma los items de cola y etiqueta estados", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
      const mockResponse: AuditQueueResponse = {
        items: [
          {
            id: "queue-1",
            project: "Brand",
            type: "full",
            status: "running",
            started_at: "2025-11-04T10:20:00Z",
            eta_seconds: 300,
          },
        ],
        next_cursor: null,
        total: 1,
      };

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchAuditQueue();

      expect(result.items).toEqual([
        {
          id: "queue-1",
          project: "Brand",
          type: "full",
          status: "En ejecucion",
          startedAt: "10:20",
          eta: "05:00",
        },
      ]);
      expect(result.nextCursor).toBeNull();
      expect(result.total).toBe(1);
    });

    it("retorna fallback ante fallo", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchAuditQueue();

      expect(result).toEqual(createAuditQueueFallback());
    });
  });

  describe("fetchAuditHistory", () => {
    it("formatea timestamps y devuelve filas", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
      const mockResponse: AuditHistoryResponse = {
        items: [
          {
            id: "hist-1",
            project: "Brand",
            completed_at: "2025-10-30T15:54:00Z",
            score: 90,
            critical_issues: 1,
            owner: "SEO",
          },
        ],
        next_cursor: null,
        total: 1,
      };

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchAuditHistory();

      expect(result.items).toEqual([
        {
          id: "hist-1",
          project: "Brand",
          finishedAt: "30 Oct @ 15:54",
          score: 90,
          criticalIssues: 1,
          owner: "SEO",
        },
      ]);
      expect(result.nextCursor).toBeNull();
      expect(result.total).toBe(1);
    });

    it("usa fallback cuando hay error", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchAuditHistory();

      expect(result).toEqual(createAuditHistoryFallback());
    });
  });

  describe("fetchAuditPerformance", () => {
    it("devuelve puntos y agregados desde la API", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
      const mockResponse: AuditPerformanceResponse = {
        points: [
          {
            id: "perf-1",
            project: "Brand",
            completed_at: "2025-10-30T15:54:00Z",
            score: 90,
            critical_issues: 1,
            duration_seconds: 780,
          },
        ],
        aggregates: {
          average_score: 90,
          average_duration_seconds: 780,
          max_duration_seconds: 780,
          sample_size: 1,
          duration_distribution: [
            { label: "<5m", count: 0 },
            { label: "5-10m", count: 0 },
            { label: "10-15m", count: 1 },
            { label: ">15m", count: 0 },
          ],
        },
      };

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchAuditPerformance();

      expect(result.points[0].label).toContain("30");
      expect(result.points[0].label).toContain("15:54");
      expect(result.aggregates.averageScore).toBe(90);
      expect(result.aggregates.sampleSize).toBe(1);
      expect(result.aggregates.durationDistribution[2].count).toBe(1);
    });

    it("usa fallback ante errores", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchAuditPerformance();

      expect(result).toEqual(createAuditPerformanceFallback());
    });
  });

  describe("fetchPendingAudits", () => {
    it("formatea auditorias pendientes", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: "queue-2",
              project: "Blog",
              type: "contenido",
              status: "pending",
              started_at: null,
              eta_seconds: null,
            },
          ],
          count: 1,
        }),
      } as Response);

      const result = await fetchPendingAudits();
      expect(result.count).toBe(1);
      expect(result.items[0].status).toBe("Pendiente");
    });

    it("usa fallback cuando falla la peticion", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchPendingAudits();
      expect(result).toEqual(createPendingAuditsFallback());
    });
  });
});
