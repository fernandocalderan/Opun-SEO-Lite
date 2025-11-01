"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiPreferences } from "@/lib/stores/uiPreferences";
import { useMemo } from "react";

const NAV_ITEMS = [
  { label: "Overview", href: "/" },
  { label: "Reputation", href: "/reputation" },
  { label: "Audits", href: "/audits" },
  { label: "Plan", href: "/plan" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUiPreferences((state) => ({
    sidebarCollapsed: state.sidebarCollapsed,
    toggleSidebar: state.toggleSidebar,
  }));

  const activeMap = useMemo(() => {
    return NAV_ITEMS.reduce<Record<string, boolean>>((acc, item) => {
      const isActive =
        item.href === "/"
          ? pathname === "/"
          : pathname?.startsWith(item.href) ?? false;
      acc[item.href] = isActive;
      return acc;
    }, {});
  }, [pathname]);

  return (
    <aside
      className={`flex min-h-screen flex-col gap-6 border-r border-border bg-surface px-4 py-6 transition-[width] duration-200 ${
        sidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`${sidebarCollapsed ? "hidden" : "space-y-1"}`}>
          <span className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-brand-primary">
            Opun Intelligence Suite
          </span>
          <h1 className="text-lg font-semibold text-text-heading">Control Center</h1>
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-alt text-xs font-medium text-text-muted transition hover:border-border-strong hover:text-text-heading"
          aria-label={sidebarCollapsed ? "Expandir menu lateral" : "Contraer menu lateral"}
        >
          {sidebarCollapsed ? ">>" : "<<"}
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeMap[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-text-body hover:bg-brand-primary/5 hover:text-brand-primary"
              } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
              aria-current={isActive ? "page" : undefined}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span
                className={`${
                  sidebarCollapsed ? "text-xs font-semibold uppercase" : ""
                }`}
              >
                {sidebarCollapsed ? item.label.charAt(0) : item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div
        className={`mt-auto rounded-xl border border-border bg-surface-alt px-4 py-5 text-xs text-text-muted ${
          sidebarCollapsed ? "hidden" : "block"
        }`}
      >
        <p className="font-semibold text-text-heading">Reputacion en tiempo real</p>
        <p className="mt-2">
          Conecta tus cuentas de social listening y SERP monitoring para activar alertas en vivo.
        </p>
      </div>
    </aside>
  );
}
