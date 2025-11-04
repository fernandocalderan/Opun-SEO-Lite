import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getPlanBoard, getPlanTable, getPlanVelocity } from "../store/planStore";

export async function registerPlanRoutes(app: FastifyInstance) {
  app.get("/v1/plan/board", async () => {
    const columns = await getPlanBoard();
    return z
      .array(
        z.object({
          title: z.string(),
          items: z.array(
            z.object({ id: z.string(), title: z.string(), impact: z.string(), effort: z.string(), owner: z.string(), due: z.string() }),
          ),
        }),
      )
      .parse(columns);
  });

  app.get("/v1/plan/table", async () => {
    const rows = await getPlanTable();
    return z
      .array(
        z.object({
          id: z.string(),
          category: z.string(),
          task: z.string(),
          impact: z.string(),
          effort: z.string(),
          status: z.string(),
          owner: z.string(),
          due: z.string(),
        }),
      )
      .parse(rows);
  });

  app.get("/v1/plan/velocity", async () => {
    const items = await getPlanVelocity();
    return z
      .array(z.object({ sprint: z.string(), planned: z.number(), completed: z.number() }))
      .parse(items);
  });
}

