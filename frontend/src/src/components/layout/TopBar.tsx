"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useUiPreferences, type ThemeMode } from "@/lib/stores/uiPreferences";

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Sistema" },
];

export function TopBar() {
  const { toggleSidebar } = useUiPreferences((state) => ({
    toggleSidebar: state.toggleSidebar,
  }));

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <div className="flex items-center gap-3 text-sm text-text-muted">
        <button
          type="button"
          onClick={toggleSidebar}
          className="inline-flex items-center rounded-lg border border-border bg-surface-alt px-3 py-1 text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-brand-primary transition hover:border-border-strong"
        >
          Menu
        </button>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-600">
          Live
        </span>
        <span>Ultima sincronizacion: hace 3 minutos</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-text-muted">
        <ThemeSwitcher />
        <button className="rounded-full border border-border px-3 py-1 transition hover:bg-surface-alt">
          Invitar equipo
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
          OP
        </div>
      </div>
    </header>
  );
}

function ThemeSwitcher() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { themeOverride, setThemeOverride } = useUiPreferences((state) => ({
    themeOverride: state.themeOverride,
    setThemeOverride: state.setThemeOverride,
  }));

  useEffect(() => {
    if (!theme) {
      return;
    }
    const normalized = (theme === "system" ? "system" : theme) as ThemeMode;
    if (themeOverride !== normalized) {
      setThemeOverride(normalized);
    }
  }, [theme, themeOverride, setThemeOverride]);

  const handleSelect = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    setThemeOverride(nextTheme);
  };

  const labelMap = THEME_OPTIONS.reduce<Record<string, string>>((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

  const resolvedLabel =
    themeOverride === "system"
      ? resolvedTheme
        ? labelMap[resolvedTheme] ?? labelMap.system
        : labelMap.system
      : labelMap[themeOverride] ?? "Tema";

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 rounded-lg border border-border bg-surface-alt p-1">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition ${
              themeOverride === option.value
                ? "bg-brand-primary text-white"
                : "text-text-muted hover:bg-brand-primary/5 hover:text-brand-primary"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {resolvedLabel}
      </span>
    </div>
  );
}
