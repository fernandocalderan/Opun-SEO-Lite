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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Libreria de templates</h2>
          <p className="text-xs text-slate-500">
            Selecciona un template para previsualizar la estructura JSON sugerida.
          </p>
        </div>
        <button className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-100">
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
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <h3 className="text-sm font-semibold text-slate-800">
                  {template.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {template.description}
                </p>
                <button
                  type="button"
                  onClick={() => setSelected(template)}
                  className="mt-4 inline-flex items-center rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                >
                  {isActive ? "Seleccionado" : "Previsualizar"}
                </button>
              </article>
            );
          })}
        </div>
        <div className="h-full rounded-xl border border-slate-200 bg-slate-50 p-4">
          {preview ? (
            <div className="flex h-full flex-col">
              <header className="flex items-center justify-between text-xs text-slate-500">
                <span>JSON Preview</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-100"
                >
                  Copiar JSON
                </button>
              </header>
              <pre className="mt-3 flex-1 overflow-auto rounded-lg bg-white p-3 text-[11px] leading-tight text-slate-700">
                {JSON.stringify(preview, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Selecciona un template para ver la estructura propuesta.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
