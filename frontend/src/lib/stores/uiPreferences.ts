"use client";

import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

type UiPreferencesState = {
  sidebarCollapsed: boolean;
  themeOverride: ThemeMode;
  setThemeOverride: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
};

export const useUiPreferences = create<UiPreferencesState>((set) => ({
  sidebarCollapsed: false,
  themeOverride: "system",
  setThemeOverride: (mode) => set({ themeOverride: mode }),
  toggleSidebar: () =>
    set((prev) => ({
      sidebarCollapsed: !prev.sidebarCollapsed,
    })),
}));
