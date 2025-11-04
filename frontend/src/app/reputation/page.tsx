"use client";

import { ChannelBreakdown } from "@/modules/reputation/ChannelBreakdown";
import { MentionsTable } from "@/modules/reputation/MentionsTable";
import { SentimentTimeline } from "@/modules/reputation/SentimentTimeline";
import { KpiCard } from "@/components/KpiCard";
import { useReputationChannels, useReputationMentions, useReputationSummary, useReputationTimeline } from "@/modules/reputation/hooks";

export default function ReputationPage() {
  const summary = useReputationSummary();
  const timeline = useReputationTimeline();
  const channels = useReputationChannels();
  const mentions = useReputationMentions();

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
        {(summary.data ?? []).map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <SentimentTimeline data={timeline.data ?? []} />
        <ChannelBreakdown channels={channels.data ?? []} />
      </section>

      <MentionsTable mentions={mentions.data ?? []} />
    </div>
  );
}
