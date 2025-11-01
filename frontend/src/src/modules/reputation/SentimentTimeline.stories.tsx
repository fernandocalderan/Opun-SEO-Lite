import type { Meta, StoryObj } from "@storybook/react";
import { SentimentTimeline } from "./SentimentTimeline";
import { sentimentTimeline } from "@/lib/mocks";

const meta: Meta<typeof SentimentTimeline> = {
  title: "Reputation/SentimentTimeline",
  component: SentimentTimeline,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SentimentTimeline>;

export const Default: Story = {
  args: {
    data: sentimentTimeline,
  },
};
