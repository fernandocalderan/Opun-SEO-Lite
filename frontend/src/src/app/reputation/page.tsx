import { ChannelBreakdown } from "@/modules/reputation/ChannelBreakdown";
import { MentionsTable } from "@/modules/reputation/MentionsTable";
import { SentimentTimeline } from "@/modules/reputation/SentimentTimeline";
import {
  channelBreakdown,
  recentMentions,
  sentimentTimeline,
} from "@/lib/mocks";
import { KpiCard } from "@/components/KpiCard";

export default function ReputationPage() {
  const kpis = [
    {
      label: "Reputation Score",
      value: "74 / 100",
      delta: "-5 semana",
      status: "watch" as const,
      description:
        "Descenso por menciones negativas en foros especializados.",
    },
    {
      label: "Alertas activas",
      value: "6",
      delta: "3 criticas",
      status: "risk" as const,
      description:
        "Dos hilos en Reddit, una review G2 y tres post sociales pendientes.",
    },
    {
      label: "Share de voz positivo",
      value: "42%",
      delta: "+8 vs. mes anterior",
      status: "good" as const,
      description:
        "Campana de PR genero 3 publicaciones con link a landing principal.",
    },
  ];

  return (
    <div className="space-y-6 p-8">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-brand-primary">
          Reputation Watch
        </span>
        <h1 className="text-3xl font-semibold text-text-heading">
          Monitoreo y mitigacion en vivo
        </h1>
        <p className="text-sm text-text-body">
          Consolida menciones, alertas ORM y accionables coordinados con el equipo de PR.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <SentimentTimeline data={sentimentTimeline} />
        <ChannelBreakdown channels={channelBreakdown} />
      </section>

      <MentionsTable mentions={recentMentions} />
    </div>
  );
}
