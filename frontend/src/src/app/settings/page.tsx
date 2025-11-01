import { initialSettings } from "@/lib/mocks";
import { SettingsForm } from "@/modules/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-8">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-brand-primary">
          Configuration
        </span>
        <h1 className="text-3xl font-semibold text-text-heading">
          Preferencias del proyecto
        </h1>
        <p className="text-sm text-text-body">
          Define la URL principal y personaliza las fuentes, alertas y flujos de reputacion y SEO.
        </p>
      </header>

      <SettingsForm initialData={initialSettings} />
    </div>
  );
}
