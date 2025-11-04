import type { Meta, StoryObj } from "@storybook/react";
import AuditsPage from "../app/audits/page";

const meta: Meta<typeof AuditsPage> = {
  title: "Pages/Audits",
  component: AuditsPage,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const Default: StoryObj<typeof AuditsPage> = {};
