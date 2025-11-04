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

type PerformancePoint = {
  id: string;
  project: string;
  label: string;
  completedAtIso?: string;
  score: number;
  criticalIssues: number;
  durationSeconds: number;
};

type PerformanceAggregates = {
  averageScore: number;
  averageDurationSeconds: number;
  maxDurationSeconds: number;
  sampleSize: number;
};

type Props = {
  data: PerformancePoint[];
  aggregates: PerformanceAggregates;
  onRefresh?: () => void;
  isLoading?: boolean;
};

export function AuditPerformance({ data, aggregates, onRefresh, isLoading }: Props) {
  const [showCritical, setShowCritical] = useState(true);

  const chartData = useMemo(
    () =>
      [...data]
        .map((item) => ({
          ...item,
          label: item.label,
        }))
        .reverse(),
    [data],
  );

  if (!chartData.length) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-surface-subtle p-6 text-center text-sm text-text-muted">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-text-heading">
            Aun no hay mediciones de performance
          </h2>
          <p>Ejecuta tus primeras auditorias para visualizar la tendencia.</p>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-body transition hover:bg-surface disabled:opacity-60"
          >
            {isLoading ? "Actualizando..." : "Refrescar"}
          </button>
        </div>
      </section>
    );
  }

  const formattedAverageDuration = formatDuration(aggregates.averageDurationSeconds);
  const formattedMaxDuration = formatDuration(aggregates.maxDurationSeconds);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-text-heading">
            Consistencia de auditorias
          </h2>
          <p className="text-xs text-text-muted">
            Evolucion de score final y issues criticos por auditoria reciente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCritical((previous) => !previous)}
            className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-muted transition hover:bg-surface-alt"
          >
            {showCritical ? "Ocultar issues" : "Ver issues"}
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-muted transition hover:bg-surface-alt disabled:opacity-60"
          >
            {isLoading ? "Actualizando..." : "Refrescar"}
          </button>
        </div>
      </header>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <StatCard label="Score promedio" value={`${aggregates.averageScore.toFixed(1)} pts`} />
        <StatCard label="Duracion promedio" value={formattedAverageDuration} />
        <StatCard label="Duracion maxima" value={formattedMaxDuration} />
        <StatCard label="Auditorias" value={String(aggregates.sampleSize)} />
      </div>

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

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface-alt p-4 text-sm">
      <p className="text-xs uppercase tracking-[var(--tracking-wide)] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-text-heading">{value}</p>
    </div>
  );
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "--";
  }
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60)
    .toString()
    .padStart(2, "0");
  const remaining = (rounded % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}
