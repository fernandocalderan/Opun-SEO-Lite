import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAuditSummaryFallback,
  fetchAuditSummary,
  type AuditSummaryResponse,
} from "./audits";

const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

describe("fetchAuditSummary", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
  });

  it("retorna tarjetas mapeadas desde la API", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
    const mockResponse: AuditSummaryResponse = {
      overall_score: 88,
      critical_issues: 2,
      warnings: 5,
      opportunities: 3,
      last_run: "2025-11-03T12:00:00Z",
    };

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
