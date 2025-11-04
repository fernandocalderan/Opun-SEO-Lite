import type { Meta, StoryObj } from "@storybook/react";
import { AuditSummary } from "./AuditSummary";
import { auditSummary } from "@/lib/mocks";

const meta: Meta<typeof AuditSummary> = {
  title: "Audits/AuditSummary",
  component: AuditSummary,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof AuditSummary>;

export const Default: Story = {
  args: {
    items: auditSummary,
  },
};
