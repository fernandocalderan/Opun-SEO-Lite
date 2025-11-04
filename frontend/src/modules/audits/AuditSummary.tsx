"use client";

import { KpiCard } from "@/components/KpiCard";

import type { FC } from "react";

type SummaryItem = {
  label: string;
  value: string;
  delta: string;
  status?: "good" | "watch" | "risk";
};

type Props = {
  items: SummaryItem[];
};

export const AuditSummary: FC<Props> = ({ items }) => {
  return (
    <section className="grid gap-5 md:grid-cols-3">
      {items.map((item) => (
        <KpiCard key={item.label} {...item} status={item.status ?? "watch"} />
      ))}
    </section>
  );
};
