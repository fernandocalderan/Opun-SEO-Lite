import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAuditHistoryFallback,
  createAuditQueueFallback,
  createAuditSummaryFallback,
  fetchAuditHistory,
  fetchAuditQueue,
  fetchAuditSummary,
  type AuditHistoryResponse,
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
      };

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchAuditQueue();

      expect(result).toEqual([
        {
          id: "queue-1",
          project: "Brand",
          type: "full",
          status: "En ejecucion",
          startedAt: "10:20",
          eta: "05:00",
        },
      ]);
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
      };

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchAuditHistory();

      expect(result).toEqual([
        {
          id: "hist-1",
          project: "Brand",
          finishedAt: "30 Oct @ 15:54",
          score: 90,
          criticalIssues: 1,
          owner: "SEO",
        },
      ]);
    });

    it("usa fallback cuando hay error", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchAuditHistory();

      expect(result).toEqual(createAuditHistoryFallback());
    });
  });
});
