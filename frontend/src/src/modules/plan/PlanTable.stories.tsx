import type { Meta, StoryObj } from "@storybook/react";
import { PlanTable } from "./PlanTable";
import { planTable } from "@/lib/mocks/plan";

const meta: Meta<typeof PlanTable> = {
  title: "Plan/PlanTable",
  component: PlanTable,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof PlanTable>;

export const Default: Story = {
  args: {
    rows: planTable,
  },
};
