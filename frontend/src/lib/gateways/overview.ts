import {
  keyInsights,
  kpiSummary,
  overviewNarrative,
  reputationAlerts,
} from "../mocks";
import type {
  InsightItem,
  KpiSummaryItem,
  OverviewNarrative,
  ReputationAlert,
} from "../mocks/types";

/**
 * Raw response shape following the OpenAPI schema #/components/schemas/OverviewResponse.
 * Mantain snake_case keys to align with backend contract.
 */
export type OverviewResponse = {
  kpis: Array<{
    label: string;
    value: string;
    delta: string;
    status: KpiSummaryItem["status"];
    description: string;
  }>;
  alerts: Array<{
    id: string;
    channel: string;
    summary: string;
    sentiment: ReputationAlert["sentiment"];
    published_at: string;
    url: string;
  }>;
  insights: Array<{
    title: string;
    context: string;
    recommendation: string;
    severity: InsightItem["severity"];
    source: string;
  }>;
  narrative: {
    headline: string;
    summary: string;
    updated_at: string;
  };
};

export type OverviewDataset = {
  kpis: KpiSummaryItem[];
  alerts: ReputationAlert[];
  insights: InsightItem[];
  narrative: OverviewNarrative;
};

const overviewMockResponse: OverviewResponse = {
  kpis: kpiSummary.map((kpi) => ({
    label: kpi.label,
    value: kpi.value,
    delta: kpi.delta,
    status: kpi.status,
    description: kpi.description,
  })),
  alerts: reputationAlerts.map((alert) => ({
    id: alert.id,
    channel: alert.channel,
    summary: alert.summary,
    sentiment: alert.sentiment,
    published_at: alert.publishedAt,
    url: alert.url,
  })),
  insights: keyInsights.map((insight) => ({
    title: insight.title,
    context: insight.context,
    recommendation: insight.recommendation,
    severity: insight.severity,
    source: insight.source,
  })),
  narrative: {
    headline: overviewNarrative.headline,
    summary: overviewNarrative.summary,
    updated_at: overviewNarrative.updatedAt,
  },
};

function normalizeOverviewResponse(response: OverviewResponse): OverviewDataset {
  return {
    kpis: response.kpis.map((kpi) => ({
      label: kpi.label,
      value: kpi.value,
      delta: kpi.delta,
      status: kpi.status,
      description: kpi.description,
    })),
    alerts: response.alerts.map((alert) => ({
      id: alert.id,
      channel: alert.channel,
      summary: alert.summary,
      sentiment: alert.sentiment,
      publishedAt: alert.published_at,
      url: alert.url,
    })),
    insights: response.insights.map((insight) => ({
      title: insight.title,
      context: insight.context,
      recommendation: insight.recommendation,
      severity: insight.severity,
      source: insight.source,
    })),
    narrative: {
      headline: response.narrative.headline,
      summary: response.narrative.summary,
      updatedAt: response.narrative.updated_at,
    },
  };
}

const SIMULATED_DELAY_MS = 120;

export type FetchOverviewOptions = {
  signal?: AbortSignal;
};

export async function fetchOverview(
  options?: FetchOverviewOptions,
): Promise<OverviewDataset> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, SIMULATED_DELAY_MS);
    options?.signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("aborted", "AbortError"));
    });
  });

  return normalizeOverviewResponse(overviewMockResponse);
}
