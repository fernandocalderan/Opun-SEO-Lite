import { auditSummary as auditSummaryMock } from "../mocks";
import type { AuditSummaryItem } from "../mocks/types";
import { formatRelativeTimeFromNow } from "../utils/relativeTime";

export type AuditSummaryCard = AuditSummaryItem & {
  status?: "good" | "watch" | "risk";
};

export type AuditSummaryResponse = {
  overall_score: number;
  critical_issues: number;
  warnings: number;
  opportunities: number;
  last_run: string;
};

const REQUEST_TIMEOUT_MS = 5_000;

export function createAuditSummaryFallback(): AuditSummaryCard[] {
  return auditSummaryMock.map((item) => ({
    ...item,
    status: "watch",
  }));
}

export type FetchAuditSummaryOptions = {
  signal?: AbortSignal;
};

export async function fetchAuditSummary(
  options?: FetchAuditSummaryOptions,
): Promise<AuditSummaryCard[]> {
  const baseUrl = getApiBaseUrl();

  if (baseUrl) {
    try {
      const payload = await fetchAuditSummaryFromApi(
        baseUrl,
        options?.signal,
      );
      if (payload) {
        return transformAuditSummary(payload);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[fetchAuditSummary] fallback to mocks", error);
      }
    }
  }

  return createAuditSummaryFallback();
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
}

async function fetchAuditSummaryFromApi(
  baseUrl: string,
  externalSignal?: AbortSignal,
): Promise<AuditSummaryResponse | null> {
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
    const response = await fetch(`${baseUrl}/v1/audits/summary`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch audit summary: ${response.status}`);
    }

    return (await response.json()) as AuditSummaryResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}

function transformAuditSummary(response: AuditSummaryResponse): AuditSummaryCard[] {
  const scoreStatus = getScoreStatus(response.overall_score);
  const issuesStatus = getIssueStatus(response.critical_issues);

  return [
    {
      label: "Score global",
      value: `${response.overall_score} / 100`,
      delta: `Ultima corrida ${formatRelativeTimeFromNow(response.last_run)}`,
      status: scoreStatus,
    },
    {
      label: "Issues criticos",
      value: String(response.critical_issues),
      delta: `${response.warnings} advertencias activas`,
      status: issuesStatus,
    },
    {
      label: "Oportunidades",
      value: String(response.opportunities),
      delta: "Backlog priorizado",
      status: response.opportunities > 5 ? "watch" : "good",
    },
  ];
}

function getScoreStatus(score: number): "good" | "watch" | "risk" {
  if (score >= 85) return "good";
  if (score >= 70) return "watch";
  return "risk";
}

function getIssueStatus(count: number): "good" | "watch" | "risk" {
  if (count <= 2) return "good";
  if (count <= 5) return "watch";
  return "risk";
}
