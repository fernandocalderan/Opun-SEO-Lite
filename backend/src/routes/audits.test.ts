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
    expect(response.body).toEqual({
      items: auditQueueMock,
      next_cursor: null,
    });
  });
});

describe("GET /v1/audits/history", () => {
  it("retorna historial paginado", async () => {
    const response = await request(app.server).get("/v1/audits/history");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: auditHistoryMock,
      next_cursor: null,
    });
  });
});

describe("GET /v1/audits/performance", () => {
  it("retorna puntos de performance", async () => {
    const response = await request(app.server).get("/v1/audits/performance");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      points: auditPerformanceMock,
    });
  });
});
