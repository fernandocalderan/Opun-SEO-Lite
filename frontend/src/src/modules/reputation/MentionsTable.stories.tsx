import type { Meta, StoryObj } from "@storybook/react";
import { MentionsTable } from "./MentionsTable";
import { recentMentions } from "@/lib/mocks/reputation";

const meta: Meta<typeof MentionsTable> = {
  title: "Reputation/MentionsTable",
  component: MentionsTable,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof MentionsTable>;

export const Default: Story = {
  args: {
    mentions: recentMentions,
  },
};
