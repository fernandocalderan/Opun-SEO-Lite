import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOverview } from "./overview";

afterEach(() => {
  vi.useRealTimers();
});

describe("fetchOverview", () => {
  it("retorna dataset normalizado con datos mock", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-11-03T00:00:00Z"));

    const promise = fetchOverview();
    await vi.advanceTimersByTimeAsync(200);
    const data = await promise;

    expect(data.kpis).toHaveLength(3);
    expect(data.alerts.every((alert) => "publishedAt" in alert)).toBe(true);
    expect(data.alerts.every((alert) => typeof alert.source === "string")).toBe(true);
    expect(data.alerts.every((alert) => alert.publishedAtIso)).toBe(true);
    expect(data.narrative.headline).toBeDefined();
  });

  it("propaga AbortError si la peticion es cancelada", async () => {
    vi.useFakeTimers();

    const controller = new AbortController();
    const promise = fetchOverview({ signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toThrowError(DOMException);
  });
});
