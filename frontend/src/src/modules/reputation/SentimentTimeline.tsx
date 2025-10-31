"use client";

import type { FC } from "react";

type TimelinePoint = {
  date: string;
  score: number;
  negative: number;
  positive: number;
};

type Props = {
  data: TimelinePoint[];
};

export const SentimentTimeline: FC<Props> = ({ data }) => {
  const maxScore = Math.max(...data.map((item) => item.score));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Evolucion del sentimiento
          </h2>
          <p className="text-sm text-slate-500">
            Promedio diario ponderado por volumen de menciones.
          </p>
        </div>
        <span className="text-sm font-medium text-slate-400">Escala 0 - 100</span>
      </header>
      <div className="mt-5 grid gap-3 sm:grid-cols-7">
        {data.map((point) => {
          const height = Math.round((point.score / maxScore) * 100);
          return (
            <div
              key={point.date}
              className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-3 text-center"
            >
              <span className="text-xs text-slate-400">{point.date}</span>
              <div className="flex h-28 w-10 flex-col-reverse overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-t from-indigo-500 via-sky-400 to-emerald-400 transition-all"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {point.score}
              </span>
              <p className="text-[11px] leading-tight text-slate-500">
                +{point.positive} / -{point.negative}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
