import type { Meta, StoryObj } from "@storybook/react";
import { ReportList } from "./ReportList";
import { reportList } from "@/lib/mocks/reports";

const meta: Meta<typeof ReportList> = {
  title: "Reports/ReportList",
  component: ReportList,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ReportList>;

export const Default: Story = {
  args: {
    reports: reportList,
  },
};
