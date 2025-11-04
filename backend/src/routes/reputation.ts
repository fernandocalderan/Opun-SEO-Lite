import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getReputationChannels, getReputationMentions, getReputationSummary, getReputationTimeline } from "../store/reputationStore";

export async function registerReputationRoutes(app: FastifyInstance) {
  app.get("/v1/reputation/summary", async () => {
    const items = await getReputationSummary();
    return z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          delta: z.string(),
          status: z.enum(["good", "watch", "risk"]),
          description: z.string(),
        }),
      )
      .parse(items);
  });

  app.get("/v1/reputation/timeline", async () => {
    const points = await getReputationTimeline();
    return z
      .array(
        z.object({ date: z.string(), score: z.number(), negative: z.number(), positive: z.number() }),
      )
      .parse(points);
  });

  app.get("/v1/reputation/channels", async () => {
    const channels = await getReputationChannels();
    return z
      .array(
        z.object({ channel: z.string(), exposure: z.string(), sentiment: z.string(), share: z.string() }),
      )
      .parse(channels);
  });

  app.get("/v1/reputation/mentions", async () => {
    const items = await getReputationMentions();
    return z
      .array(
        z.object({
          id: z.string(),
          source: z.string(),
          sentiment: z.enum(["negativo", "neutral", "positivo"]),
          snippet: z.string(),
          published_at: z.string(),
          reach: z.string(),
          action: z.string(),
        }),
      )
      .parse(items);
  });
}

