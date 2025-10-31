"use client";

import type { ReactNode } from "react";

type StatusVariant = "good" | "watch" | "risk";

const variantStyles: Record<StatusVariant, string> = {
  good: "bg-emerald-50 text-emerald-600 border-emerald-200",
  watch: "bg-amber-50 text-amber-600 border-amber-200",
  risk: "bg-rose-50 text-rose-600 border-rose-200",
};

export type KpiCardProps = {
  label: string;
  value: string;
  delta?: string;
  status?: StatusVariant;
  icon?: ReactNode;
  description?: string;
};

export function KpiCard({
  label,
  value,
  delta,
  status = "good",
  icon,
  description,
}: KpiCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-sm font-medium text-zinc-500">{label}</span>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
            {value}
          </p>
          {delta ? (
            <span
              className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantStyles[status]}`}
            >
              {delta}
            </span>
          ) : null}
        </div>
        {icon ? (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            {icon}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="text-sm leading-relaxed text-zinc-500">{description}</p>
      ) : null}
    </article>
  );
}
