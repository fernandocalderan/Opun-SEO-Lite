import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { addPlanItem, deletePlanItem, getPlanBoard, getPlanTable, getPlanVelocity, updatePlanItem } from "../store/planStore";

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

  app.post("/v1/plan/items", async (request) => {
    const body = z.object({
      column: z.string(),
      item: z.object({ title: z.string(), impact: z.string(), effort: z.string(), owner: z.string(), due: z.string() }),
    }).parse(request.body);
    const created = await addPlanItem(body.column, body.item);
    return created;
  });

  app.patch("/v1/plan/items/:id", async (request, reply) => {
    const id = (request.params as { id: string }).id;
    const patch = z.object({
      title: z.string().optional(),
      impact: z.string().optional(),
      effort: z.string().optional(),
      owner: z.string().optional(),
      due: z.string().optional(),
      column: z.string().optional(),
    }).parse(request.body ?? {});
    const updated = await updatePlanItem(id, patch);
    if (!updated) return reply.code(404).send({ error: "Not found" });
    return updated;
  });

  app.delete("/v1/plan/items/:id", async (request, reply) => {
    const id = (request.params as { id: string }).id;
    const removed = await deletePlanItem(id);
    if (!removed) return reply.code(404).send({ error: "Not found" });
    return { id };
  });
}
