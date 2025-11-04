"use client";

import { useMemo, useState } from "react";

type Template = {
  id: string;
  name: string;
  description: string;
};

const templateSkeleton = {
  metadata: {
    title: "",
    project: "",
    generated_at: "",
  },
  sections: [
    { heading: "Resumen ejecutivo", content: [] },
    { heading: "Hallazgos", content: [] },
    { heading: "Acciones recomendadas", content: [] },
  ],
};

export function TemplateLibrary({ templates }: { templates: Template[] }) {
  const [selected, setSelected] = useState<Template | null>(null);

  const preview = useMemo(() => {
    if (!selected) {
      return null;
    }

    return {
      ...templateSkeleton,
      metadata: {
        ...templateSkeleton.metadata,
        title: selected.name,
      },
    };
  }, [selected]);

  const handleCopy = () => {
    if (!preview) {
      return;
    }

    if (navigator.clipboard) {
      void navigator.clipboard.writeText(JSON.stringify(preview, null, 2));
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-heading">Libreria de templates</h2>
          <p className="text-xs text-text-body">
            Selecciona un template para previsualizar la estructura JSON sugerida.
          </p>
        </div>
        <button className="rounded-full border border-border px-3 py-1 text-xs text-text-body hover:bg-surface-alt">
          Gestionar templates
        </button>
      </header>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr,1fr]">
        <div className="grid gap-3 md:grid-cols-2">
          {templates.map((template) => {
            const isActive = selected?.id === template.id;
            return (
              <article
                key={template.id}
                className={`rounded-xl border p-4 shadow-inner transition ${
                  isActive
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-border bg-surface-subtle"
                }`}
              >
                <h3 className="text-sm font-semibold text-slate-800">
                  {template.name}
                </h3>
                <p className="mt-2 text-sm text-text-body">
                  {template.description}
                </p>
                <button
                  type="button"
                  onClick={() => setSelected(template)}
                  className="mt-4 inline-flex items-center rounded-full border border-indigo-200 bg-surface px-3 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                >
                  {isActive ? "Seleccionado" : "Previsualizar"}
                </button>
              </article>
            );
          })}
        </div>
        <div className="h-full rounded-xl border border-border bg-surface-subtle p-4">
          {preview ? (
            <div className="flex h-full flex-col">
              <header className="flex items-center justify-between text-xs text-text-body">
                <span>JSON Preview</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-full border border-border bg-surface px-2 py-1 text-xs hover:bg-surface-alt"
                >
                  Copiar JSON
                </button>
              </header>
              <pre className="mt-3 flex-1 overflow-auto rounded-lg bg-surface p-3 text-[11px] leading-tight text-text-heading">
                {JSON.stringify(preview, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              Selecciona un template para ver la estructura propuesta.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
