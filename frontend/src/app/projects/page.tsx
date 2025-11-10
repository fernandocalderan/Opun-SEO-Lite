"use client";

import { ProjectsManager } from "@/modules/settings/ProjectsManager";
import { SettingsForm } from "@/modules/settings/SettingsForm";
import { initialSettings } from "@/lib/mocks";

export default function ProjectsPage() {
  return (
    <div className="space-y-6 p-8">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-brand-primary">
          Registro
        </span>
        <h1 className="text-3xl font-semibold text-text-heading">Clientes y monitoreo</h1>
        <p className="text-sm text-text-body">
          Registra clientes/proyectos, activa el monitoreo constante y configura sus preferencias.
        </p>
      </header>

      <ProjectsManager />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-text-heading">Preferencias del proyecto</h2>
        <SettingsForm initialData={initialSettings} />
      </section>
    </div>
  );
}

