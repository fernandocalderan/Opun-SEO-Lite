import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildServer } from "../server";
import { overviewResponseSchema } from "./overview";

const app = buildServer();

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /v1/overview", () => {
  it("responde 200 con payload alineado al contrato", async () => {
    const response = await request(app.server).get("/v1/overview");

    expect(response.status).toBe(200);
    expect(() => overviewResponseSchema.parse(response.body)).not.toThrow();
    expect(response.body).toHaveProperty("narrative.headline");
    expect(response.body.alerts[0]).toHaveProperty("source");
  });
});
