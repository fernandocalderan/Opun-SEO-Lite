"use client";

type Template = {
  id: string;
  name: string;
  description: string;
};

export function TemplateLibrary({ templates }: { templates: Template[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Libreria de templates</h2>
        <button className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-100">
          Gestionar templates
        </button>
      </header>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {templates.map((template) => (
          <article
            key={template.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner"
          >
            <h3 className="text-sm font-semibold text-slate-800">
              {template.name}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{template.description}</p>
            <button className="mt-4 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              Usar template
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
