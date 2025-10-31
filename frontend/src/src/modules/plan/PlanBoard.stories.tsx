import type { Meta, StoryObj } from "@storybook/react";
import { PlanBoard } from "./PlanBoard";
import { planColumns } from "@/lib/mocks/plan";

const meta: Meta<typeof PlanBoard> = {
  title: "Plan/PlanBoard",
  component: PlanBoard,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof PlanBoard>;

export const Default: Story = {
  args: {
    columns: planColumns,
  },
};
