"use client";

import type { RankRow } from "@/lib/gateways/reputation";

export function KeywordRankTable({ rows }: { rows: RankRow[] }) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
        Agrega palabras clave para ver su posicion actual.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="min-w-[640px] text-sm">
        <thead className="bg-surface-subtle text-left text-xs font-semibold text-text-muted">
          <tr>
            <th className="px-3 py-2">Keyword</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Posición</th>
            <th className="px-3 py-2">URL encontrada</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, idx) => (
            <tr key={`${r.keyword}-${idx}`}>
              <td className="px-3 py-2 font-medium text-text-heading">{r.keyword}</td>
              <td className="px-3 py-2">{r.status === "found" ? "Encontrada" : "No encontrada"}</td>
              <td className="px-3 py-2">{r.position ?? "—"}</td>
              <td className="px-3 py-2 text-ellipsis text-xs">
                {r.found_url ? (
                  <a href={r.found_url} className="text-brand-primary hover:underline" target="_blank" rel="noreferrer">
                    {r.found_url}
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

