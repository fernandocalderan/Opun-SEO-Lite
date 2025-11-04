import type { Meta, StoryObj } from "@storybook/react";
import { InsightPanel } from "./InsightPanel";

const meta: Meta<typeof InsightPanel> = {
  title: "Dashboard/InsightPanel",
  component: InsightPanel,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof InsightPanel>;

export const Default: Story = {
  args: {
    items: [
      {
        title: "Mencion negativa escala en foros",
        context:
          "El hilo mas activo en Reddit concentra el 65% del sentimiento negativo semanal. Usuarios citan desconocimiento del nuevo SLA.",
        recommendation:
          "Coordinar respuesta oficial con PR, actualizar FAQs y compartir tutorial en Slack comunidad.",
        severity: "critical",
        source: "Monitor ORM",
      },
      {
        title: "Opportunity: review positivo en medios",
        context:
          "Medio especializado resalto la velocidad de despliegue. No se ha amplificado en redes.",
        recommendation:
          "Generar snippet social con quote destacado y sumarlo al newsletter del viernes.",
        severity: "medium",
        source: "SERP Watch",
      },
    ],
  },
};
