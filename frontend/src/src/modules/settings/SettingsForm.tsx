"use client";

import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  ChannelPreferences,
  ConfigurationState,
  IntegrationsSettings,
  Stakeholder,
} from "./types";

const cloneConfig = (config: ConfigurationState): ConfigurationState =>
  JSON.parse(JSON.stringify(config)) as ConfigurationState;

const isValidUrl = (value: string) => {
  if (!value) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return Boolean(parsed);
  } catch {
    return false;
  }
};

type SettingsFormProps = {
  initialData: ConfigurationState;
};

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [config, setConfig] = useState<ConfigurationState>(() => cloneConfig(initialData));
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  const urlValid = useMemo(() => isValidUrl(config.project.primaryUrl), [config.project.primaryUrl]);
  const hasChanges = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(initialData),
    [config, initialData],
  );

  const updateSection = <K extends keyof ConfigurationState>(
    section: K,
    value: Partial<ConfigurationState[K]>,
  ) => {
    setConfig((previous) => ({
      ...previous,
      [section]: { ...previous[section], ...value },
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!urlValid) {
      setStatus("error");
      return;
    }
    console.table(config);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 3000);
  };

  const handleReset = () => {
    setConfig(cloneConfig(initialData));
    setStatus("idle");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <SectionCard
        title="Identidad del proyecto"
        description="Define la URL a auditar y el contexto estrategico. Todos los campos son opcionales salvo la URL principal."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Nombre interno"
            value={config.project.projectName}
            onChange={(value) => updateSection("project", { projectName: value })}
            placeholder="Ej. Opun ORM LATAM"
          />
          <TextField
            label="Nombre publico"
            value={config.project.publicName}
            onChange={(value) => updateSection("project", { publicName: value })}
            placeholder="Nombre visible en reportes"
          />
          <TextField
            label="URL principal"
            value={config.project.primaryUrl}
            onChange={(value) => updateSection("project", { primaryUrl: value })}
            placeholder="https://"
            required
            error={!urlValid}
            helperText={urlValid ? undefined : "Proporciona una URL valida (incluyendo https://)."}
          />
          <NumberField
            label="SLA objetivo (minutos)"
            value={config.project.slaMinutes}
            onChange={(value) => updateSection("project", { slaMinutes: value })}
            min={0}
          />
        </div>
        <ListInput
          label="URLs criticas adicionales"
          placeholder="https://landing.opun.example"
          description="Landing pages, centros de ayuda o propiedades relevantes que deban auditarse."
          values={config.project.relatedUrls}
          onChange={(values) => updateSection("project", { relatedUrls: values })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <ListInput
            label="Industrias / verticales"
            placeholder="MarTech"
            values={config.project.industries}
            onChange={(values) => updateSection("project", { industries: values })}
          />
          <ListInput
            label="Mercados y regiones"
            placeholder="Mexico"
            values={config.project.markets}
            onChange={(values) => updateSection("project", { markets: values })}
          />
        </div>
        <ListInput
          label="Objetivos del monitoreo"
          placeholder="Incrementar share of voice SEO"
          values={config.project.objectives}
          onChange={(values) => updateSection("project", { objectives: values })}
        />
        <StakeholderList
          stakeholders={config.project.stakeholders}
          onChange={(stakeholders) => updateSection("project", { stakeholders })}
        />
      </SectionCard>

      <SectionCard
        title="Entradas SEO y tracking"
        description="Gestiona palabras clave, competidores y preferencias de auditoria tecnica."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ListInput
            label="Keywords primarias"
            placeholder="gestion reputacion online"
            values={config.seo.primaryKeywords}
            onChange={(values) => updateSection("seo", { primaryKeywords: values })}
          />
          <ListInput
            label="Keywords secundarias / LSI"
            placeholder="monitor de menciones"
            values={config.seo.secondaryKeywords}
            onChange={(values) => updateSection("seo", { secondaryKeywords: values })}
          />
          <ListInput
            label="Keywords negativas"
            placeholder="gratis"
            values={config.seo.negativeKeywords}
            onChange={(values) => updateSection("seo", { negativeKeywords: values })}
          />
          <ListInput
            label="Dominios competidores"
            placeholder="https://competidor.example"
            values={config.seo.competitorDomains}
            onChange={(values) => updateSection("seo", { competitorDomains: values })}
          />
        </div>
        <ListInput
          label="SERP features objetivo"
          placeholder="featured snippet"
          values={config.seo.targetSerpFeatures}
          onChange={(values) => updateSection("seo", { targetSerpFeatures: values })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Frecuencia de crawl"
            value={config.seo.crawlFrequency}
            onChange={(value) => updateSection("seo", { crawlFrequency: value })}
            options={[
              { label: "Diario", value: "daily" },
              { label: "Semanal", value: "weekly" },
              { label: "Mensual", value: "monthly" },
              { label: "Trimestral", value: "quarterly" },
            ]}
          />
          <SelectField
            label="Profundidad del crawler"
            value={config.seo.crawlDepth}
            onChange={(value) => updateSection("seo", { crawlDepth: value })}
            options={[
              { label: "Rastro superficial", value: "shallow" },
              { label: "Estandar", value: "standard" },
              { label: "Completo", value: "deep" },
            ]}
          />
        </div>
        <ListInput
          label="Regiones prioritarias"
          placeholder="Espana"
          values={config.seo.monitoringRegions}
          onChange={(values) => updateSection("seo", { monitoringRegions: values })}
        />
      </SectionCard>

      <SectionCard
        title="Monitoreo reputacional"
        description="Delimita temas sensibles, hashtags, exclusiones y el alcance de canales a vigilar."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ListInput
            label="Tematicas clave"
            placeholder="lanzamiento IA"
            values={config.reputation.topics}
            onChange={(values) => updateSection("reputation", { topics: values })}
          />
          <ListInput
            label="Hashtags prioritarios"
            placeholder="#OpunAI"
            values={config.reputation.hashtags}
            onChange={(values) => updateSection("reputation", { hashtags: values })}
          />
          <ListInput
            label="Terminos a excluir"
            placeholder="ofertas de empleo"
            values={config.reputation.excludeTerms}
            onChange={(values) => updateSection("reputation", { excludeTerms: values })}
          />
          <ListInput
            label="Fuentes personalizadas"
            placeholder="https://podcastmarketing.example/rss"
            values={config.reputation.customSources}
            onChange={(values) => updateSection("reputation", { customSources: values })}
          />
        </div>
        <ChannelSelector
          value={config.reputation.channels}
          onChange={(channels) => updateSection("reputation", { channels })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <NumberField
            label="Alerta critica (sentiment <=)"
            value={config.reputation.sentimentCriticalThreshold}
            onChange={(value) => updateSection("reputation", { sentimentCriticalThreshold: value })}
            min={0}
            max={100}
          />
          <NumberField
            label="Alerta preventiva (sentiment <=)"
            value={config.reputation.sentimentWarningThreshold}
            onChange={(value) => updateSection("reputation", { sentimentWarningThreshold: value })}
            min={0}
            max={100}
          />
        </div>
        <ListInput
          label="Idiomas de monitoreo"
          placeholder="es"
          values={config.reputation.languages}
          onChange={(values) => updateSection("reputation", { languages: values })}
        />
        <ListInput
          label="Contactos de escalamiento"
          placeholder="crisis@opun.example"
          values={config.reputation.escalationContacts}
          onChange={(values) => updateSection("reputation", { escalationContacts: values })}
        />
      </SectionCard>
      <SectionCard
        title="Integraciones y fuentes"
        description="Activa los conectores clave para enriquecer hallazgos y automatizar acciones."
      >
        <IntegrationGrid
          value={config.integrations}
          onChange={(integrations) => updateSection("integrations", integrations)}
        />
      </SectionCard>

      <SectionCard
        title="Alertas y reportes"
        description="Configura umbrales, ventanas de silencio y entregables recurrentes."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <NumberField
            label="Alerta por pico de volumen (%)"
            value={config.alerts.volumeSpikeThreshold}
            onChange={(value) => updateSection("alerts", { volumeSpikeThreshold: value })}
            min={0}
          />
          <NumberField
            label="Alerta por caida de sentimiento (pts)"
            value={config.alerts.sentimentDropThreshold}
            onChange={(value) => updateSection("alerts", { sentimentDropThreshold: value })}
            min={0}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SwitchField
            label="Resumen diario por email"
            checked={config.alerts.dailyDigest}
            onChange={(checked) => updateSection("alerts", { dailyDigest: checked })}
          />
          <SwitchField
            label="Reporte ejecutivo semanal"
            checked={config.alerts.weeklyExecutiveReport}
            onChange={(checked) => updateSection("alerts", { weeklyExecutiveReport: checked })}
          />
        </div>
        <TextField
          label="Canal de Slack en tiempo real"
          value={config.alerts.realtimeSlackChannel}
          onChange={(value) => updateSection("alerts", { realtimeSlackChannel: value })}
          placeholder="#reputation-alerts"
        />
        <ListInput
          label="Destinatarios email"
          placeholder="alertas@opun.example"
          values={config.alerts.emailRecipients}
          onChange={(values) => updateSection("alerts", { emailRecipients: values })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <TimeField
            label="Inicio horario silencioso"
            value={config.alerts.quietHours.start}
            onChange={(value) =>
              updateSection("alerts", {
                quietHours: { ...config.alerts.quietHours, start: value },
              })
            }
          />
          <TimeField
            label="Fin horario silencioso"
            value={config.alerts.quietHours.end}
            onChange={(value) =>
              updateSection("alerts", {
                quietHours: { ...config.alerts.quietHours, end: value },
              })
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Colaboracion y gobernanza"
        description="Establece flujos de revision, politicas de retencion y compromisos legales."
      >
        <ListInput
          label="Equipos participantes"
          placeholder="SEO Squad"
          values={config.collaboration.teams}
          onChange={(values) => updateSection("collaboration", { teams: values })}
        />
        <TextAreaField
          label="Flujo de revision"
          value={config.collaboration.reviewerWorkflow}
          onChange={(value) => updateSection("collaboration", { reviewerWorkflow: value })}
          placeholder="Detalla pasos para validar alertas o reportes antes de publicarlos."
          rows={4}
        />
        <TextAreaField
          label="Notas compartidas"
          value={config.collaboration.sharedNotes}
          onChange={(value) => updateSection("collaboration", { sharedNotes: value })}
          placeholder="Documenta hallazgos, decisiones clave o aprendizajes."
          rows={4}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <NumberField
            label="Retencion de datos (dias)"
            value={config.governance.dataRetentionDays}
            onChange={(value) => updateSection("governance", { dataRetentionDays: value })}
            min={0}
          />
          <SwitchField
            label="Anonimizar datos personales"
            checked={config.governance.anonymizePersonalData}
            onChange={(checked) => updateSection("governance", { anonymizePersonalData: checked })}
          />
        </div>
        <TextAreaField
          label="Notas sobre PII"
          value={config.governance.piiNotes}
          onChange={(value) => updateSection("governance", { piiNotes: value })}
          placeholder="Define reglas internas, excepciones o protocolos con legal."
          rows={3}
        />
        <SwitchField
          label="Equipo legal aprobo esta configuracion"
          checked={config.governance.legalAcknowledged}
          onChange={(checked) => updateSection("governance", { legalAcknowledged: checked })}
        />
      </SectionCard>

      <ActionBar
        status={status}
        hasChanges={hasChanges}
        onReset={handleReset}
        submitDisabled={!urlValid || !hasChanges}
      />
    </form>
  );
}
type SectionCardProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

function SectionCard({ title, description, actions, children }: SectionCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="space-y-6 p-6">{children}</div>
    </section>
  );
}

const inputClassName = (error?: boolean) =>
  [
    "w-full rounded-md border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500",
    error ? "border-red-500 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-900",
  ].join(" ");

type FieldWrapperProps = {
  label: string;
  helperText?: string;
  error?: boolean;
  children: ReactNode;
};

function FieldWrapper({ label, helperText, error, children }: FieldWrapperProps) {
  return (
    <label className="flex w-full flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {helperText ? (
        <span className={`text-xs ${error ? "text-red-600" : "text-slate-500"}`}>{helperText}</span>
      ) : null}
    </label>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  error?: boolean;
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  helperText,
  error,
}: TextFieldProps) {
  return (
    <FieldWrapper label={label} helperText={helperText} error={error}>
      <input
        type="text"
        className={inputClassName(error)}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldWrapper>
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }: TextAreaFieldProps) {
  return (
    <FieldWrapper label={label}>
      <textarea
        className={`${inputClassName(false)} min-h-[120px] resize-y`}
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldWrapper>
  );
}

type NumberFieldProps = {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  placeholder?: string;
  min?: number;
  max?: number;
};

function NumberField({ label, value, onChange, placeholder, min, max }: NumberFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (nextValue === "") {
      onChange("");
      return;
    }
    const numeric = Number(nextValue);
    if (!Number.isNaN(numeric)) {
      onChange(numeric);
    }
  };

  return (
    <FieldWrapper label={label}>
      <input
        type="number"
        className={inputClassName(false)}
        value={value === "" ? "" : value}
        placeholder={placeholder}
        min={min}
        max={max}
        onChange={handleChange}
      />
    </FieldWrapper>
  );
}

type SelectFieldProps<T extends string> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
};

function SelectField<T extends string>({ label, value, onChange, options }: SelectFieldProps<T>) {
  return (
    <FieldWrapper label={label}>
      <select
        className={inputClassName(false)}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

type TimeFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function TimeField({ label, value, onChange }: TimeFieldProps) {
  return (
    <FieldWrapper label={label}>
      <input
        type="time"
        className={inputClassName(false)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldWrapper>
  );
}

type SwitchFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function SwitchField({ label, checked, onChange }: SwitchFieldProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-slate-100">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-indigo-500" : "bg-slate-300"
        }`}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}
type ListInputProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  description?: string;
};

function ListInput({ label, values, onChange, placeholder, description }: ListInputProps) {
  const [draft, setDraft] = useState("");

  const addValue = () => {
    const candidate = draft.trim();
    if (!candidate || values.includes(candidate)) {
      setDraft("");
      return;
    }
    onChange([...values, candidate]);
    setDraft("");
  };

  const removeValue = (value: string) => {
    onChange(values.filter((item) => item !== value));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addValue();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          className={`${inputClassName(false)} max-w-xs`}
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="rounded-md border border-indigo-500 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
          onClick={addValue}
        >
          Agregar
        </button>
      </div>
      {values.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {values.map((value) => (
            <li
              key={value}
              className="group inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700"
            >
              <span>{value}</span>
              <button
                type="button"
                className="text-indigo-400 transition group-hover:text-indigo-700"
                onClick={() => removeValue(value)}
                aria-label={`Eliminar ${value}`}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-400">Sin valores. Agrega alguno si aplica.</p>
      )}
    </div>
  );
}

type StakeholderListProps = {
  stakeholders: Stakeholder[];
  onChange: (stakeholders: Stakeholder[]) => void;
};

function StakeholderList({ stakeholders, onChange }: StakeholderListProps) {
  const updateStakeholder = (index: number, value: Partial<Stakeholder>) => {
    onChange(stakeholders.map((item, idx) => (idx === index ? { ...item, ...value } : item)));
  };

  const removeStakeholder = (index: number) => {
    onChange(stakeholders.filter((_, idx) => idx !== index));
  };

  const addStakeholder = () => {
    onChange([
      ...stakeholders,
      { name: "", email: "", responsibility: "", channel: "" },
    ]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Stakeholders y responsables</h3>
        <button
          type="button"
          className="rounded-md border border-indigo-500 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
          onClick={addStakeholder}
        >
          Agregar responsable
        </button>
      </div>
      {stakeholders.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">
          Suma a las personas que deben recibir alertas o validaciones. Puedes dejar vacio si aun no se define.
        </p>
      ) : (
        <div className="space-y-4">
          {stakeholders.map((stakeholder, index) => (
            <div
              key={`${stakeholder.email || "stakeholder"}-${index}`}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <TextField
                  label="Nombre"
                  value={stakeholder.name}
                  onChange={(value) => updateStakeholder(index, { name: value })}
                  placeholder="Nombre y apellido"
                />
                <TextField
                  label="Email"
                  value={stakeholder.email}
                  onChange={(value) => updateStakeholder(index, { email: value })}
                  placeholder="persona@opun.example"
                />
                <TextField
                  label="Responsabilidad"
                  value={stakeholder.responsibility}
                  onChange={(value) => updateStakeholder(index, { responsibility: value })}
                  placeholder="Brand y PR"
                />
                <SelectField
                  label="Canal preferido"
                  value={stakeholder.channel}
                  onChange={(value) => updateStakeholder(index, { channel: value })}
                  options={[
                    { label: "Seleccionar canal", value: "" },
                    { label: "Email", value: "email" },
                    { label: "Slack", value: "slack" },
                    { label: "SMS", value: "sms" },
                    { label: "Microsoft Teams", value: "teams" },
                  ]}
                />
              </div>
              <div className="mt-3 text-right">
                <button
                  type="button"
                  className="text-xs font-medium text-red-500 hover:text-red-600"
                  onClick={() => removeStakeholder(index)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type ChannelSelectorProps = {
  value: ChannelPreferences;
  onChange: (value: ChannelPreferences) => void;
};

const CHANNEL_LABELS: Record<keyof ChannelPreferences, string> = {
  social: "Redes sociales",
  forums: "Foros y comunidades",
  news: "Medios y noticias",
  reviews: "Resenas y marketplaces",
  video: "Video y streaming",
  blogs: "Blogs especializados",
};

function ChannelSelector({ value, onChange }: ChannelSelectorProps) {
  const toggle = (channel: keyof ChannelPreferences) => {
    onChange({ ...value, [channel]: !value[channel] });
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-slate-700">Canales a monitorear</span>
      <div className="grid gap-3 md:grid-cols-3">
        {Object.entries(CHANNEL_LABELS).map(([key, label]) => {
          const active = value[key as keyof ChannelPreferences];
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key as keyof ChannelPreferences)}
              className={`flex flex-col gap-1 rounded-lg border px-4 py-3 text-left text-sm transition ${
                active
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="font-semibold">{label}</span>
              <span className="text-xs text-slate-500">
                {active ? "Incluido en el monitoreo" : "Haz clic para activar"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type IntegrationGridProps = {
  value: IntegrationsSettings;
  onChange: (value: IntegrationsSettings) => void;
};

const INTEGRATION_GROUPS: Array<{
  title: string;
  items: Array<{ key: keyof IntegrationsSettings; label: string; hint: string }>;
}> = [
  {
    title: "Social listening",
    items: [
      { key: "twitter", label: "X / Twitter", hint: "Captura menciones en tiempo real." },
      { key: "facebook", label: "Facebook", hint: "Monitorea paginas y comentarios." },
      { key: "instagram", label: "Instagram", hint: "Analiza contenido y hashtags." },
      { key: "linkedin", label: "LinkedIn", hint: "Sigue conversaciones B2B." },
      { key: "youtube", label: "YouTube", hint: "Detecta resenas y video resenas." },
    ],
  },
  {
    title: "SEO intelligence",
    items: [
      { key: "searchConsole", label: "Google Search Console", hint: "Mide cobertura y rendimiento." },
      { key: "ga4", label: "Google Analytics 4", hint: "Cruza datos de trafico y conversion." },
      { key: "semrush", label: "Semrush", hint: "Auditorias y keywords competitivas." },
      { key: "ahrefs", label: "Ahrefs", hint: "Backlinks y health score." },
    ],
  },
  {
    title: "Operaciones y CX",
    items: [
      { key: "salesforce", label: "Salesforce", hint: "Escala casos comerciales." },
      { key: "hubspot", label: "HubSpot", hint: "Sincroniza deals y tickets." },
      { key: "zendesk", label: "Zendesk", hint: "Cierra el loop con soporte." },
    ],
  },
];

function IntegrationGrid({ value, onChange }: IntegrationGridProps) {
  const toggle = (key: keyof IntegrationsSettings) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="space-y-6">
      {INTEGRATION_GROUPS.map((group) => (
        <div key={group.title} className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">{group.title}</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {group.items.map((integration) => {
              const active = value[integration.key];
              return (
                <button
                  key={integration.key}
                  type="button"
                  onClick={() => toggle(integration.key)}
                  className={`flex flex-col gap-2 rounded-lg border px-4 py-3 text-left text-sm transition ${
                    active
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="font-semibold">{integration.label}</span>
                  <span className="text-xs text-slate-500">{integration.hint}</span>
                  <span className="text-xs font-semibold">{active ? "Activo" : "Inactivo"}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

type ActionBarProps = {
  hasChanges: boolean;
  submitDisabled: boolean;
  status: "idle" | "saved" | "error";
  onReset: () => void;
};

function ActionBar({ hasChanges, submitDisabled, status, onReset }: ActionBarProps) {
  return (
    <footer className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-white/95 p-6 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className={`rounded-md px-4 py-2 text-sm font-medium text-white transition ${
              submitDisabled ? "cursor-not-allowed bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            disabled={submitDisabled}
          >
            Guardar configuracion
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            disabled={!hasChanges}
            onClick={onReset}
          >
            Revertir cambios
          </button>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="text-xs text-slate-500">
        La URL principal es el unico campo obligatorio. El resto es opcional para adaptarse a distintos niveles de madurez reputacional.
      </p>
    </footer>
  );
}

type StatusBadgeProps = {
  status: "idle" | "saved" | "error";
};

function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Cambios guardados temporalmente
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Revisa la URL antes de guardar
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
      <span className="h-2 w-2 rounded-full bg-slate-400" />
      Sin cambios pendientes
    </span>
  );
}
