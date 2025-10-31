import type { Meta, StoryObj } from "@storybook/react";
import { KpiCard, type KpiCardProps } from "./KpiCard";

const meta: Meta<typeof KpiCard> = {
  title: "Dashboard/KpiCard",
  component: KpiCard,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["good", "watch", "risk"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof KpiCard>;

const baseArgs: KpiCardProps = {
  label: "SEO Health",
  value: "82 / 100",
  delta: "+6 vs. last sprint",
  status: "good",
  description:
    "Auditoria tecnica estable; se detectaron 3 issues criticos pendientes.",
};

export const Default: Story = {
  args: baseArgs,
};

export const Watch: Story = {
  args: {
    ...baseArgs,
    label: "Reputation Score",
    value: "74",
    delta: "-5 vs. semana anterior",
    status: "watch",
    description:
      "Caida en SERP page 1 por menciones negativas. Revisar plan ORM.",
  },
};

export const Risk: Story = {
  args: {
    ...baseArgs,
    label: "CTR Brand Search",
    value: "3.4%",
    delta: "-1.2pp frente a benchmark",
    status: "risk",
    description:
      "Faltan rich snippets y copy consistente en meta tags. Priorizar quick wins.",
  },
};
