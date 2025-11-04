import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildServer } from "../server";
import { auditSummaryMock } from "../mocks/audits";

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
