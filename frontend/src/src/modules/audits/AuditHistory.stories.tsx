import type { Meta, StoryObj } from "@storybook/react";
import { AuditHistory } from "./AuditHistory";
import { auditHistory } from "@/lib/mocks/audits";

const meta: Meta<typeof AuditHistory> = {
  title: "Audits/AuditHistory",
  component: AuditHistory,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof AuditHistory>;

export const Default: Story = {
  args: {
    items: auditHistory,
  },
};
