"use client";

import { useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Channel = {
  channel: string;
  exposure: string;
  sentiment: string;
  share: string;
};

export function ChannelBreakdown({ channels }: { channels: Channel[] }) {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const chartData = useMemo(
    () =>
      channels.map((item) => ({
        name: item.channel,
        value: Number.parseFloat(item.share.replace("%", "")) || 0,
      })),
    [channels],
  );

  const colors = ["#6366f1", "#14b8a6", "#f59e0b", "#f97316", "#f43f5e"];

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text-heading">
          Distribucion por canal
        </h2>
        <span className="text-xs uppercase tracking-widest text-text-muted">
          Ultimos 7 dias
        </span>
      </header>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr,1.1fr]">
        <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-subtle p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}% share`,
                  name,
                ]}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "#cbd5f5",
                  fontSize: 12,
                }}
              />
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={3}
                strokeWidth={1.5}
                onMouseEnter={(_, index) =>
                  setHighlighted(chartData[index]?.name ?? null)
                }
                onMouseLeave={() => setHighlighted(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={colors[index % colors.length]}
                    opacity={
                      highlighted && highlighted !== entry.name ? 0.45 : 0.9
                    }
                    stroke={colors[index % colors.length]}
                    strokeWidth={highlighted === entry.name ? 3 : 1.5}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-auto rounded-xl border border-border">
          <table className="min-w-full table-fixed divide-y divide-slate-200 text-sm">
            <thead className="bg-surface-subtle text-left font-medium text-text-body">
              <tr>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Exposicion</th>
                <th className="px-4 py-3">Sentimiento dominante</th>
                <th className="px-4 py-3 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channels.map((item) => (
                <tr
                  key={item.channel}
                  onMouseEnter={() => setHighlighted(item.channel)}
                  onMouseLeave={() => setHighlighted(null)}
                  className={`transition ${
                    highlighted === item.channel ? "bg-brand-primary/10" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-text-heading whitespace-nowrap align-middle">
                    {item.channel}
                  </td>
                  <td className="px-4 py-3 text-text-body align-middle whitespace-nowrap">{item.exposure}</td>
                  <td className="px-4 py-3 align-middle">
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-text-body">
                      <i
                        aria-hidden
                        className={`h-2.5 w-2.5 rounded-full ${item.sentiment === "positivo" ? "bg-emerald-500" : item.sentiment === "negativo" ? "bg-rose-500" : "bg-slate-400"}`}
                      />
                      <span className="whitespace-nowrap">{item.sentiment}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-text-heading align-middle">
                    {item.share}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
