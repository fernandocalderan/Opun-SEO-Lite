"use client";

import type { FC } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TimelinePoint = {
  date: string;
  score: number;
  negative: number;
  positive: number;
};

type Props = {
  data: TimelinePoint[];
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
};

const SentimentTooltip: FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const score = payload.find((entry) => entry.name === "Score")?.value ?? 0;
  const positive =
    payload.find((entry) => entry.name === "Positivas")?.value ?? 0;
  const negative =
    payload.find((entry) => entry.name === "Negativas")?.value ?? 0;

  return (
    <div className="rounded-xl border border-border bg-surface p-3 shadow-lg">
      <p className="text-xs font-semibold text-indigo-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-text-heading">
        Score ponderado: {score}
      </p>
      <p className="text-xs text-emerald-600">+{positive} menciones</p>
      <p className="text-xs text-rose-600">-{negative} menciones</p>
    </div>
  );
};

export const SentimentTimeline: FC<Props> = ({ data }) => {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-heading">
            Evolucion del sentimiento
          </h2>
          <p className="text-sm text-text-body">
            Promedio diario ponderado por volumen de menciones.
          </p>
        </div>
        <span className="text-sm font-medium text-text-muted">
          Escala 0 - 100
        </span>
      </header>

      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="sentimentScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.85} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="sentimentPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#bbf7d0" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="sentimentNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb7185" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#fecdd3" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5f5" }}
            />
            <YAxis
              yAxisId="score"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5f5" }}
              domain={[0, 100]}
            />
            <YAxis
              yAxisId="mentions"
              orientation="right"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={{ stroke: "#cbd5f5" }}
              allowDecimals={false}
            />
            <Tooltip content={<SentimentTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-xs font-medium text-text-body">{value}</span>
              )}
            />
            <ReferenceLine y={60} stroke="#f97316" strokeDasharray="5 5" yAxisId="score" />
            <Area
              type="monotone"
              dataKey="score"
              name="Score"
              stroke="#6366f1"
              fill="url(#sentimentScore)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, fill: "#4338ca" }}
              activeDot={{ r: 5 }}
              yAxisId="score"
            />
            <Area
              type="monotone"
              dataKey="positive"
              name="Positivas"
              stroke="#22c55e"
              fill="url(#sentimentPositive)"
              strokeWidth={2}
              yAxisId="mentions"
            />
            <Area
              type="monotone"
              dataKey="negative"
              name="Negativas"
              stroke="#f43f5e"
              fill="url(#sentimentNegative)"
              strokeWidth={2}
              yAxisId="mentions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
