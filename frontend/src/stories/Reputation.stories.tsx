import type { Meta, StoryObj } from "@storybook/react";
import ReputationPage from "../app/reputation/page";

const meta: Meta<typeof ReputationPage> = {
  title: "Pages/Reputation",
  component: ReputationPage,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const Default: StoryObj<typeof ReputationPage> = {};
