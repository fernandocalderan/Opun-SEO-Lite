import type { Meta, StoryObj } from "@storybook/react";
import { ChannelBreakdown } from "./ChannelBreakdown";
import { channelBreakdown } from "@/lib/mocks";

const meta: Meta<typeof ChannelBreakdown> = {
  title: "Reputation/ChannelBreakdown",
  component: ChannelBreakdown,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ChannelBreakdown>;

export const Default: Story = {
  args: {
    channels: channelBreakdown,
  },
};
