"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type HistoryItem = {
  id: string;
  project: string;
  finishedAt: string;
  score: number;
  criticalIssues: number;
};

type Props = {
  history: HistoryItem[];
};

export function AuditPerformance({ history }: Props) {
  const [showCritical, setShowCritical] = useState(true);

  const chartData = useMemo(
    () =>
      history
        .map((item) => ({
          ...item,
          label: item.finishedAt,
        }))
        .reverse(),
    [history],
  );

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-heading">
            Consistencia de auditorias
          </h2>
          <p className="text-xs text-text-muted">
            Evolucion de score final y issues criticos por auditoria reciente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCritical((previous) => !previous)}
          className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-muted transition hover:bg-surface-alt"
        >
          {showCritical ? "Ocultar issues" : "Ver issues"}
        </button>
      </header>

      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5f5" }}
            />
            <YAxis
              yAxisId="score"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5f5" }}
              domain={[0, 100]}
            />
            <YAxis
              yAxisId="issues"
              orientation="right"
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={{ stroke: "#cbd5f5" }}
            />
            <Tooltip
              formatter={(value: number, name: string) =>
                name === "Score"
                  ? [`${value.toFixed(0)} pts`, name]
                  : [`${value} issues`, name]
              }
              contentStyle={{ borderRadius: 12, borderColor: "#cbd5f5", fontSize: 12 }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: "#64748b" }}
            />
            <ReferenceLine y={85} stroke="#22c55e" strokeDasharray="4 6" yAxisId="score" />
            <Line
              yAxisId="score"
              type="monotone"
              dataKey="score"
              name="Score"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3, fill: "#4338ca" }}
              activeDot={{ r: 5 }}
            />
            {showCritical ? (
              <Line
                yAxisId="issues"
                type="monotone"
                dataKey="criticalIssues"
                name="Issues criticos"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 3, fill: "#ea580c" }}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
