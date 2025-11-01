"use client";

import type { FC } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ActivityPoint = {
  date: string;
  generated: number;
  shared: number;
};

type Props = {
  data: ActivityPoint[];
};

export const ReportActivityChart: FC<Props> = ({ data }) => {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-heading">
            Actividad semanal de reportes
          </h2>
          <p className="text-xs text-text-body">
            Volumen de reportes generados y compartidos por dia (mock data).
          </p>
        </div>
        <span className="text-xs text-text-muted">
          Ultimos 7 dias
        </span>
      </header>

      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="reportsGenerated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="reportsShared" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5f5" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5f5" }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [`${value} reportes`, name]}
              contentStyle={{ borderRadius: 12, borderColor: "#cbd5f5", fontSize: 12 }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: 12, color: "#64748b" }}
            />
            <Area
              type="monotone"
              dataKey="generated"
              name="Generados"
              stroke="#6366f1"
              fill="url(#reportsGenerated)"
              strokeWidth={2}
              dot={{ r: 3, fill: "#4338ca" }}
            />
            <Area
              type="monotone"
              dataKey="shared"
              name="Compartidos"
              stroke="#22c55e"
              fill="url(#reportsShared)"
              strokeWidth={2}
              dot={{ r: 3, fill: "#16a34a" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
