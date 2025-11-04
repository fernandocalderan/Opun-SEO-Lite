import type { Meta, StoryObj } from "@storybook/react";
import { TemplateLibrary } from "./TemplateLibrary";
import { templateLibrary } from "@/lib/mocks";

const meta: Meta<typeof TemplateLibrary> = {
  title: "Reports/TemplateLibrary",
  component: TemplateLibrary,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof TemplateLibrary>;

export const Default: Story = {
  args: {
    templates: templateLibrary,
  },
};
