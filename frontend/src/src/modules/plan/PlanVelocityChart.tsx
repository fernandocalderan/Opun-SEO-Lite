"use client";

import type { FC } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type VelocityPoint = {
  sprint: string;
  planned: number;
  completed: number;
};

type Props = {
  data: VelocityPoint[];
};

export const PlanVelocityChart: FC<Props> = ({ data }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Velocidad del equipo
          </h2>
          <p className="text-xs text-slate-500">
            Comparativa de iniciativas planificadas vs completadas por sprint.
          </p>
        </div>
        <span className="text-xs text-slate-400">
          Fuente: registro de plan maestro (mock)
        </span>
      </header>

      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="sprint"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5f5" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5f5" }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [`${value} tareas`, name]}
              contentStyle={{ borderRadius: 12, borderColor: "#cbd5f5", fontSize: 12 }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: 12, color: "#64748b" }}
            />
            <Bar dataKey="planned" name="Planificadas" fill="#6366f1" radius={[8, 8, 0, 0]} />
            <Bar dataKey="completed" name="Completadas" fill="#22c55e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
