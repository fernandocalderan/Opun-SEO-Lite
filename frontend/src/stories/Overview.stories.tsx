import type { Meta, StoryObj } from "@storybook/react";
import Home from "../app/page";

const meta: Meta<typeof Home> = {
  title: "Pages/Overview",
  component: Home,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const Default: StoryObj<typeof Home> = {};
