import type { Meta, StoryObj } from "@storybook/react";
import { AuditQueue } from "./AuditQueue";
import { auditQueue } from "@/lib/mocks";

const meta: Meta<typeof AuditQueue> = {
  title: "Audits/AuditQueue",
  component: AuditQueue,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof AuditQueue>;

export const Default: Story = {
  args: {
    items: auditQueue,
  },
};
