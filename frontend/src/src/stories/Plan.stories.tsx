import type { Meta, StoryObj } from "@storybook/react";
import PlanPage from "../app/plan/page";

const meta: Meta<typeof PlanPage> = {
  title: "Pages/Plan",
  component: PlanPage,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const Default: StoryObj<typeof PlanPage> = {};
