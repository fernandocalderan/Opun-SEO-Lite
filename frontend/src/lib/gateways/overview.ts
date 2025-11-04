import {
  keyInsights,
  kpiSummary,
  overviewNarrative,
  reputationAlerts,
} from "../mocks";
import { formatRelativeTimeFromNow } from "../utils/relativeTime";
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
    source: string;
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
    source: alert.source,
    summary: alert.summary,
    sentiment: alert.sentiment,
    published_at: alert.publishedAtIso ?? alert.publishedAt,
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
      source: alert.source,
      summary: alert.summary,
      sentiment: alert.sentiment,
      publishedAt: formatRelativeTimeFromNow(alert.published_at),
      publishedAtIso: alert.published_at,
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
const REQUEST_TIMEOUT_MS = 5_000;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export type FetchOverviewOptions = {
  signal?: AbortSignal;
};

export async function fetchOverview(
  options?: FetchOverviewOptions,
): Promise<OverviewDataset> {
  if (API_BASE_URL) {
    try {
      const response = await fetchOverviewFromApi(API_BASE_URL, options?.signal);
      if (response) {
        return normalizeOverviewResponse(response);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[fetchOverview] Falling back to mock data:", error);
      }
    }
  }

  await waitForMockLatency(options?.signal);
  return normalizeOverviewResponse(overviewMockResponse);
}

async function fetchOverviewFromApi(
  baseUrl: string,
  externalSignal?: AbortSignal,
): Promise<OverviewResponse | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }
  }

  try {
    const response = await fetch(`${baseUrl}/v1/overview`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch overview: ${response.status}`);
    }

    const payload = (await response.json()) as OverviewResponse;
    return payload;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function waitForMockLatency(signal?: AbortSignal) {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, SIMULATED_DELAY_MS);
    if (!signal) {
      return;
    }

    const handleAbort = () => {
      clearTimeout(timeout);
      reject(new DOMException("aborted", "AbortError"));
    };

    if (signal.aborted) {
      handleAbort();
      return;
    }

    signal.addEventListener("abort", handleAbort, { once: true });
  });
}
