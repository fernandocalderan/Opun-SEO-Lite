import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createProject, deleteProject, listProjects, updateProject } from "../store/projectsStore";

export async function registerProjectRoutes(app: FastifyInstance) {
  app.get("/v1/projects", async () => {
    const items = await listProjects();
    return z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        primary_url: z.string().url(),
        keywords: z.array(z.string()),
        monitoring_enabled: z.boolean(),
        schedule: z.enum(["none","hourly","daily","weekly","monthly"]),
        last_audit_at: z.string().nullable(),
      }),
    ).parse(items);
  });

  app.post("/v1/projects", async (request) => {
    const body = z.object({
      name: z.string().min(1),
      primary_url: z.string().url(),
      keywords: z.array(z.string()).optional(),
      monitoring_enabled: z.boolean().optional(),
      schedule: z.enum(["none","hourly","daily","weekly","monthly"]).optional(),
    }).parse(request.body);
    const created = await createProject(body);
    return created;
  });

  app.patch("/v1/projects/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const patch = z.object({
      name: z.string().optional(),
      primary_url: z.string().url().optional(),
      keywords: z.array(z.string()).optional(),
      monitoring_enabled: z.boolean().optional(),
      schedule: z.enum(["none","hourly","daily","weekly","monthly"]).optional(),
    }).parse(request.body ?? {});
    const updated = await updateProject(id, patch);
    if (!updated) return reply.code(404).send({ error: "Not found" });
    return updated;
  });

  app.delete("/v1/projects/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const ok = await deleteProject(id);
    if (!ok) return reply.code(404).send({ error: "Not found" });
    return { id };
  });
}

