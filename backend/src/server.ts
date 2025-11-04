import Fastify from "fastify";
import cors from "@fastify/cors";
import { fileURLToPath } from "node:url";
import { registerOverviewRoutes } from "./routes/overview";
import { registerAuditRoutes } from "./routes/audits";
import { registerReputationRoutes } from "./routes/reputation";
import { registerPlanRoutes } from "./routes/plan";
import { registerReportsRoutes } from "./routes/reports";
import { registerProjectRoutes } from "./routes/projects";

export function buildServer() {
  const app = Fastify({
    logger: true,
  });

  void app.register(cors, {
    origin: true,
  });

  void app.register(registerOverviewRoutes);
  void app.register(registerAuditRoutes);
  void app.register(registerReputationRoutes);
  void app.register(registerPlanRoutes);
  void app.register(registerReportsRoutes);
  void app.register(registerProjectRoutes);

  return app;
}

async function start() {
  const app = buildServer();
  const port = Number(process.env.PORT ?? 3333);
  const host = process.env.HOST ?? "0.0.0.0";

  try {
    await app.listen({ port, host });
    app.log.info(`HTTP server listening on http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  void start();
}
