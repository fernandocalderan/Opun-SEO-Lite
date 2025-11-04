"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProject, deleteProject, fetchProjects, updateProject, type Project } from "@/lib/gateways/projects";
import { useState } from "react";

export function ProjectsManager() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects() });
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [keywords, setKeywords] = useState("");

  const mCreate = useMutation({
    mutationFn: () => createProject({ name, primary_url: url, keywords: parseKeywords(keywords) }),
    onSuccess: () => { setName(""); setUrl(""); setKeywords(""); qc.invalidateQueries({ queryKey: ["projects"] }); },
  });
  const mToggle = useMutation({
    mutationFn: (p: Project) => updateProject(p.id, { monitoring_enabled: !p.monitoring_enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
  const mSchedule = useMutation({
    mutationFn: ({ id, schedule }: { id: string; schedule: Project["schedule"] }) => updateProject(id, { schedule }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
  const mDelete = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-text-heading">Proyectos guardados</h2>
        <p className="text-xs text-text-muted">Registra proyectos para lanzarlos desde Audits y habilita monitoreo/scheduler.</p>
      </header>
      <form
        className="grid gap-3 md:grid-cols-[2fr,2fr,1fr,auto]"
        onSubmit={(e) => { e.preventDefault(); if (!url.trim() || !name.trim()) return; mCreate.mutate(); }}
      >
        <input className="rounded-lg border border-border bg-surface px-3 py-2 text-sm" placeholder="Nombre del proyecto" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="rounded-lg border border-border bg-surface px-3 py-2 text-sm" placeholder="URL principal (https://)" value={url} onChange={(e) => setUrl(e.target.value)} />
        <input className="rounded-lg border border-border bg-surface px-3 py-2 text-sm" placeholder="keywords (coma)" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        <button className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={mCreate.isPending}>{mCreate.isPending ? "Guardando..." : "Guardar"}</button>
      </form>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="min-w-full table-fixed divide-y divide-slate-200 text-sm">
          <thead className="bg-surface-subtle text-left font-medium text-text-body">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3">Keywords</th>
              <th className="px-4 py-3">Monitoreo</th>
              <th className="px-4 py-3">Scheduler</th>
              <th className="w-24 px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(list.data ?? []).map((p) => (
              <tr key={p.id} className="bg-surface">
                <td className="px-4 py-3 font-medium text-text-heading">{p.name}</td>
                <td className="truncate px-4 py-3 text-text-body">{p.primary_url}</td>
                <td className="px-4 py-3 text-text-body">{p.keywords.join(", ")}</td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={p.monitoring_enabled} onChange={() => mToggle.mutate(p)} />
                    <span>{p.monitoring_enabled ? "Activo" : "Inactivo"}</span>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <select className="rounded-md border border-border bg-surface px-2 py-1 text-xs" value={p.schedule} onChange={(e) => mSchedule.mutate({ id: p.id, schedule: e.target.value as Project["schedule"] })}>
                    {(["none","hourly","daily","weekly","monthly"] as const).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => mDelete.mutate(p.id)} className="rounded-full border border-border px-3 py-1 text-xs text-text-body hover:bg-surface-alt">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function parseKeywords(s: string) {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

