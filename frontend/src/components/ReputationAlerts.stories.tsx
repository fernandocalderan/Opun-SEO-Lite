import type { Meta, StoryObj } from "@storybook/react";
import { formatRelativeTimeFromNow } from "@/lib/utils/relativeTime";
import { ReputationAlerts } from "./ReputationAlerts";

const meta: Meta<typeof ReputationAlerts> = {
  title: "Dashboard/ReputationAlerts",
  component: ReputationAlerts,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ReputationAlerts>;

export const Default: Story = {
  args: {
    alerts: [
      {
        id: "alert-1",
        channel: "Foro / Reddit",
        source: "r/soporte-opun",
        summary:
          "Hilo cuestiona tiempos de respuesta del soporte; 12 comentarios negativos en 24h.",
        sentiment: "negative",
        publishedAt: formatRelativeTimeFromNow("2025-11-02T09:00:00Z"),
        publishedAtIso: "2025-11-02T09:00:00Z",
        url: "https://reddit.com",
      },
      {
        id: "alert-2",
        channel: "Top Stories",
        source: "news.google.com",
        summary:
          "Medio especializado destaca la nueva funcion IA con tono positivo.",
        sentiment: "positive",
        publishedAt: formatRelativeTimeFromNow("2025-11-01T18:30:00Z"),
        publishedAtIso: "2025-11-01T18:30:00Z",
        url: "https://news.google.com",
      },
      {
        id: "alert-3",
        channel: "Reviews / G2",
        source: "g2.com/app/opun",
        summary:
          "Review 3 estrellas menciona onboarding complejo. Sugiere reforzar tutoriales.",
        sentiment: "neutral",
        publishedAt: formatRelativeTimeFromNow("2025-10-31T22:15:00Z"),
        publishedAtIso: "2025-10-31T22:15:00Z",
        url: "https://www.g2.com",
      },
    ],
  },
};
