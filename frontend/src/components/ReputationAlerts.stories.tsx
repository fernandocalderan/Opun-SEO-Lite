import type { Meta, StoryObj } from "@storybook/react";
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
        publishedAt: "Hace 4 horas",
        url: "https://reddit.com",
      },
      {
        id: "alert-2",
        channel: "Top Stories",
        source: "news.google.com",
        summary:
          "Medio especializado destaca la nueva funcion IA con tono positivo.",
        sentiment: "positive",
        publishedAt: "Hace 9 horas",
        url: "https://news.google.com",
      },
      {
        id: "alert-3",
        channel: "Reviews / G2",
        source: "g2.com/app/opun",
        summary:
          "Review 3 estrellas menciona onboarding complejo. Sugiere reforzar tutoriales.",
        sentiment: "neutral",
        publishedAt: "Hace 1 dia",
        url: "https://www.g2.com",
      },
    ],
  },
};
