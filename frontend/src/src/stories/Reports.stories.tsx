import type { Meta, StoryObj } from "@storybook/react";
import ReportsPage from "../app/reports/page";

const meta: Meta<typeof ReportsPage> = {
  title: "Pages/Reports",
  component: ReportsPage,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const Default: StoryObj<typeof ReportsPage> = {};
