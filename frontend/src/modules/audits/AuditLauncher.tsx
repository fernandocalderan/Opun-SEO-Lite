"use client";

import { FormEvent, useReducer, useState } from "react";

const QUICK_DEFAULTS = {
  url: "",
  keywords: [] as string[],
  scanDepth: "light" as AuditScanDepth,
  includeSerp: true,
  includeReputation: true,
  includeTechnical: true,
  alerting: {
    notifyEmail: false,
    notifySlack: false,
    criticalOnly: true,
  },
  notes: "",
};

type AuditScanDepth = "light" | "standard" | "full";

type AuditConfig = typeof QUICK_DEFAULTS & {
  scanDepth: AuditScanDepth;
};

type AuditAction =
  | { type: "setUrl"; payload: string }
  | { type: "setKeywords"; payload: string[] }
  | { type: "setScanDepth"; payload: AuditScanDepth }
  | { type: "toggleSerp" }
  | { type: "toggleReputation" }
  | { type: "toggleTechnical" }
  | { type: "toggleAlert"; payload: keyof AuditConfig["alerting"] }
  | { type: "setNotes"; payload: string }
  | { type: "reset" }
  | { type: "resetQuick" };

function reducer(state: AuditConfig, action: AuditAction): AuditConfig {
  switch (action.type) {
    case "setUrl":
      return { ...state, url: action.payload };
    case "setKeywords":
      return { ...state, keywords: action.payload };
    case "setScanDepth":
      return { ...state, scanDepth: action.payload };
    case "toggleSerp":
      return { ...state, includeSerp: !state.includeSerp };
    case "toggleReputation":
      return { ...state, includeReputation: !state.includeReputation };
    case "toggleTechnical":
      return { ...state, includeTechnical: !state.includeTechnical };
    case "toggleAlert":
      return {
        ...state,
        alerting: {
          ...state.alerting,
          [action.payload]: !state.alerting[action.payload],
        },
      };
    case "setNotes":
      return { ...state, notes: action.payload };
    case "reset":
      return { ...QUICK_DEFAULTS };
    case "resetQuick":
      return {
        ...QUICK_DEFAULTS,
        url: state.url,
        keywords: state.keywords,
      };
    default:
      return state;
  }
}

type AuditLauncherProps = {
  onLaunch?: (config: AuditConfig) => Promise<void> | void;
};

export function AuditLauncher({ onLaunch }: AuditLauncherProps) {
  const [state, dispatch] = useReducer(reducer, QUICK_DEFAULTS);
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const handleQuickSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!state.url.trim()) {
      setStatus("error");
      setMessage("Por favor ingresa una URL valida");
      return;
    }
    await executeAudit({ ...state }, "quick");
  };

  const handleAdvancedSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!state.url.trim()) {
      setStatus("error");
      setMessage("La URL es obligatoria incluso en el modo avanzado");
      return;
    }
    await executeAudit({ ...state }, "advanced");
  };

  const executeAudit = async (config: AuditConfig, mode: "quick" | "advanced") => {
    try {
      setStatus("running");
      setMessage(`Ejecutando auditoria ${mode === "quick" ? "rapida" : "avanzada"}...`);
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (onLaunch) {
        await Promise.resolve(onLaunch(config));
      } else {
        console.group("Audit request");
        console.log("modo", mode);
        console.table(config);
        console.groupEnd();
      }
      setStatus("success");
      setMessage("Auditoria enviada correctamente");
      if (mode === "quick") {
        dispatch({ type: "resetQuick" });
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("No se pudo lanzar la auditoria");
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-soft">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-brand-primary">
          Quick audit
        </span>
        <h2 className="text-2xl font-semibold text-text-heading">Auditoria rapida</h2>
        <p className="text-sm text-text-body">
          Ingresa la URL de tu cliente y, si deseas, algunas palabras clave para ejecutar una auditoria
          con los criterios recomendados. Puedes profundizar los criterios en la seccion avanzada.
        </p>
      </header>

      <form onSubmit={handleQuickSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-heading" htmlFor="audit-url">
              URL del proyecto
            </label>
            <input
              id="audit-url"
              type="url"
              required
              value={state.url}
              onChange={(event) => dispatch({ type: "setUrl", payload: event.target.value })}
              placeholder="https://www.tu-cliente.com"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:ring focus:ring-brand-primary/30"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-heading" htmlFor="audit-keywords">
              Palabras clave (opcional)
            </label>
            <input
              id="audit-keywords"
              type="text"
              value={state.keywords.join(", ")}
              onChange={(event) =>
                dispatch({
                  type: "setKeywords",
                  payload: parseKeywords(event.target.value),
                })
              }
              placeholder="branding, reputacion, producto X"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:ring focus:ring-brand-primary/30"
            />
            <p className="text-xs text-text-muted">Separa los terminos con comas.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary"
            disabled={status === "running"}
          >
            {status === "running" ? "Procesando..." : "Ejecutar auditoria rapida"}
          </button>
          <button
            type="button"
            className="rounded-full border border-border px-4 py-2 text-sm text-text-body transition hover:bg-surface-alt"
            onClick={() => dispatch({ type: "reset" })}
            disabled={status === "running"}
          >
            Limpiar
          </button>
          <StatusBadge status={status} message={message} />
        </div>
      </form>

      <details className="rounded-xl border border-border bg-surface-subtle p-4">
        <summary className="cursor-pointer text-sm font-semibold text-text-heading">
          Configurar opciones avanzadas
        </summary>
        <form onSubmit={handleAdvancedSubmit} className="mt-4 space-y-6">
          <AdvancedOptions state={state} dispatch={dispatch} />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-full border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
              disabled={status === "running"}
            >
              {status === "running" ? "Procesando..." : "Lanzar con opciones avanzadas"}
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "resetQuick" })}
              className="rounded-full border border-border px-4 py-2 text-sm text-text-body transition hover:bg-surface-alt"
              disabled={status === "running"}
            >
              Restablecer valores rapidos
            </button>
          </div>
        </form>
      </details>
    </section>
  );
}

type AdvancedOptionsProps = {
  state: AuditConfig;
  dispatch: (action: AuditAction) => void;
};

function AdvancedOptions({ state, dispatch }: AdvancedOptionsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-text-heading">Profundidad del analisis</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Ligero", value: "light" },
            { label: "Estandar", value: "standard" },
            { label: "Completo", value: "full" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => dispatch({ type: "setScanDepth", payload: option.value as AuditScanDepth })}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                state.scanDepth === option.value
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                  : "border-border text-text-body hover:border-brand-primary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted">
          El modo ligero revisa checks basicos; el completo ejecuta auditorias tecnicas, reputacionales y de contenido.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-heading">Cobertura del analisis</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <ToggleCard
            title="SERP & SEO"
            description="Palabras clave, snippet y competidores directos."
            active={state.includeSerp}
            onClick={() => dispatch({ type: "toggleSerp" })}
          />
          <ToggleCard
            title="Reputacion"
            description="Fuentes sociales, reseñas y foros."
            active={state.includeReputation}
            onClick={() => dispatch({ type: "toggleReputation" })}
          />
          <ToggleCard
            title="Tecnico"
            description="Velocidad, accesibilidad y SEO tecnico."
            active={state.includeTechnical}
            onClick={() => dispatch({ type: "toggleTechnical" })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-heading">Alertas y seguimiento</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <AlertToggle
            label="Email"
            subtitle="Envia resumen diario"
            active={state.alerting.notifyEmail}
            onToggle={() => dispatch({ type: "toggleAlert", payload: "notifyEmail" })}
          />
          <AlertToggle
            label="Slack"
            subtitle="Publica alertas en el canal #audits"
            active={state.alerting.notifySlack}
            onToggle={() => dispatch({ type: "toggleAlert", payload: "notifySlack" })}
          />
          <AlertToggle
            label="Solo criticas"
            subtitle="Ignora hallazgos de baja prioridad"
            active={state.alerting.criticalOnly}
            onToggle={() => dispatch({ type: "toggleAlert", payload: "criticalOnly" })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="audit-notes" className="text-sm font-semibold text-text-heading">
          Notas internas (opcional)
        </label>
        <textarea
          id="audit-notes"
          value={state.notes}
          onChange={(event) => dispatch({ type: "setNotes", payload: event.target.value })}
          rows={3}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:ring focus:ring-brand-primary/20"
          placeholder="Contexto adicional, responsables, deadlines..."
        />
      </div>
    </div>
  );
}

type ToggleCardProps = {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
};

function ToggleCard({ title, description, active, onClick }: ToggleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full flex-col gap-2 rounded-lg border px-4 py-3 text-left text-sm transition ${
        active
          ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
          : "border-border bg-surface text-text-body hover:border-brand-primary"
      }`}
    >
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-text-body">{description}</span>
      <span className="text-xs font-semibold">{active ? "Incluido" : "Omitido"}</span>
    </button>
  );
}

type AlertToggleProps = {
  label: string;
  subtitle: string;
  active: boolean;
  onToggle: () => void;
};

function AlertToggle({ label, subtitle, active, onToggle }: AlertToggleProps) {
  return (
    <label className="flex cursor-pointer flex-col gap-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm transition hover:border-brand-primary">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-text-heading">{label}</span>
        <input
          type="checkbox"
          checked={active}
          onChange={onToggle}
          className="h-4 w-4 rounded border-border text-brand-primary focus:ring-brand-primary"
        />
      </div>
      <span className="text-xs text-text-body">{subtitle}</span>
    </label>
  );
}

type StatusBadgeProps = {
  status: "idle" | "running" | "success" | "error";
  message: string;
};

function StatusBadge({ status, message }: StatusBadgeProps) {
  if (status === "idle") {
    return null;
  }
  const colorMap: Record<StatusBadgeProps["status"], string> = {
    idle: "",
    running: "bg-amber-50 text-amber-600",
    success: "bg-emerald-50 text-emerald-600",
    error: "bg-rose-50 text-rose-600",
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${colorMap[status]}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {message}
    </span>
  );
}

function parseKeywords(value: string) {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}
