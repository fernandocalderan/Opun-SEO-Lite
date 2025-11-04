import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
    "./src/stories/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--color-brand-primary)",
          secondary: "var(--color-brand-secondary)",
          accent: "var(--color-brand-accent)",
          muted: "var(--color-brand-muted)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          subtle: "var(--color-surface-subtle)",
          alt: "var(--color-surface-alt)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        text: {
          heading: "var(--color-text-heading)",
          body: "var(--color-text-body)",
          muted: "var(--color-text-muted)",
          inverse: "var(--color-text-inverse)",
        },
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        border: "var(--shadow-border)",
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      spacing: {
        gutter: "var(--layout-gutter)",
        gap: "var(--layout-gap)",
      },
    },
  },
  plugins: [],
};

export default config;
