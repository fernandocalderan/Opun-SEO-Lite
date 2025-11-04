import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildServer } from "../server";
import {
  auditHistoryMock,
  auditPerformanceMock,
  auditQueueMock,
  auditSummaryMock,
} from "../mocks/audits";

const app = buildServer();

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /v1/audits/summary", () => {
  it("retorna resumen de auditoria validado", async () => {
    const response = await request(app.server).get("/v1/audits/summary");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(auditSummaryMock);
  });
});

describe("GET /v1/audits/queue", () => {
  it("retorna items de cola con cursor nulo", async () => {
    const response = await request(app.server).get("/v1/audits/queue");

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual(auditQueueMock.slice(0, 3));
    expect(response.body.next_cursor).toBe(Buffer.from("3").toString("base64url"));
    expect(response.body.total).toBe(auditQueueMock.length);
  });

  it("permite paginar por cursor", async () => {
    const response = await request(app.server)
      .get("/v1/audits/queue")
      .query({ limit: 2 });

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(2);
    expect(response.body.next_cursor).toBeDefined();

    const nextResponse = await request(app.server)
      .get("/v1/audits/queue")
      .query({ cursor: response.body.next_cursor, limit: 2 });

    expect(nextResponse.status).toBe(200);
    expect(nextResponse.body.items[0]).toEqual(auditQueueMock[2]);
  });
});

describe("GET /v1/audits/history", () => {
  it("retorna historial paginado", async () => {
    const response = await request(app.server).get("/v1/audits/history");

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual(auditHistoryMock.slice(0, 5));
    expect(response.body.next_cursor).toBe(Buffer.from("5").toString("base64url"));
    expect(response.body.total).toBe(auditHistoryMock.length);
  });

  it("soporta limite y cursor", async () => {
    const response = await request(app.server)
      .get("/v1/audits/history")
      .query({ limit: 2 });

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(2);
    const firstId = response.body.items[0].id;
    expect(firstId).toBe(auditHistoryMock[0].id);
    expect(response.body.next_cursor).toBeDefined();

    const nextResponse = await request(app.server)
      .get("/v1/audits/history")
      .query({ cursor: response.body.next_cursor, limit: 2 });

    expect(nextResponse.status).toBe(200);
    expect(nextResponse.body.items[0].id).toBe(auditHistoryMock[2].id);
  });
});

describe("GET /v1/audits/performance", () => {
  it("retorna puntos de performance", async () => {
    const response = await request(app.server).get("/v1/audits/performance");

    expect(response.status).toBe(200);
    expect(response.body.points).toEqual(auditPerformanceMock);
    const aggregates = response.body.aggregates;
    const expectedAverageScore =
      auditPerformanceMock.reduce((acc, point) => acc + point.score, 0) /
      auditPerformanceMock.length;
    const expectedAverageDuration =
      auditPerformanceMock.reduce(
        (acc, point) => acc + point.duration_seconds,
        0,
      ) / auditPerformanceMock.length;
    const expectedMaxDuration = Math.max(
      ...auditPerformanceMock.map((point) => point.duration_seconds),
    );

    expect(aggregates.sample_size).toBe(auditPerformanceMock.length);
    expect(aggregates.max_duration_seconds).toBe(expectedMaxDuration);
    expect(aggregates.average_score).toBeCloseTo(expectedAverageScore, 5);
    expect(aggregates.average_duration_seconds).toBeCloseTo(
      expectedAverageDuration,
      5,
    );
    expect(Array.isArray(aggregates.duration_distribution)).toBe(true);
    const totalBuckets = aggregates.duration_distribution.reduce(
      (acc: number, bucket: { count: number }) => acc + bucket.count,
      0,
    );
    expect(totalBuckets).toBe(auditPerformanceMock.length);
  });
});

describe("GET /v1/audits/pending", () => {
  it("retorna auditorias pendientes", async () => {
    const response = await request(app.server).get("/v1/audits/pending");

    expect(response.status).toBe(200);
    const pendingMock = auditQueueMock.filter((item) => item.status === "pending");
    expect(response.body.items).toEqual(pendingMock);
    expect(response.body.count).toBe(pendingMock.length);
  });
});
