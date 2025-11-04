import {
  auditHistory as auditHistoryMock,
  auditQueue as auditQueueMock,
  auditSummary as auditSummaryMock,
} from "../mocks";
import type {
  AuditHistoryItem,
  AuditQueueItem,
  AuditSummaryItem,
} from "../mocks/types";
import { formatRelativeTimeFromNow } from "../utils/relativeTime";

export type AuditSummaryCard = AuditSummaryItem & {
  status?: "good" | "watch" | "risk";
};

export type AuditQueueCard = AuditQueueItem & {
  status: "En ejecucion" | "Pendiente" | "Completada" | "Fallida";
};

export type AuditHistoryRow = AuditHistoryItem;

export type AuditSummaryResponse = {
  overall_score: number;
  critical_issues: number;
  warnings: number;
  opportunities: number;
  last_run: string;
};

export type AuditQueueResponse = {
  items: Array<{
    id: string;
    project: string;
    type: string;
    status: "running" | "pending" | "completed" | "failed";
    started_at: string | null;
    eta_seconds: number | null;
  }>;
  next_cursor: string | null;
};

export type AuditHistoryResponse = {
  items: Array<{
    id: string;
    project: string;
    completed_at: string;
    score: number;
    critical_issues: number;
    owner: string;
  }>;
  next_cursor: string | null;
};

export type FetchAuditSummaryOptions = {
  signal?: AbortSignal;
};

export type FetchAuditQueueOptions = {
  signal?: AbortSignal;
};

export type FetchAuditHistoryOptions = {
  signal?: AbortSignal;
};

const REQUEST_TIMEOUT_MS = 5_000;
const STATUS_LABEL_MAP: Record<AuditQueueResponse["items"][number]["status"], AuditQueueCard["status"]> = {
  running: "En ejecucion",
  pending: "Pendiente",
  completed: "Completada",
  failed: "Fallida",
};

const queueTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const historyDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

const historyTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function createAuditSummaryFallback(): AuditSummaryCard[] {
  return auditSummaryMock.map((item) => ({
    ...item,
    status: "watch",
  }));
}

export function createAuditQueueFallback(): AuditQueueCard[] {
  return auditQueueMock.map((item) => ({
    ...item,
    status: item.status as AuditQueueCard["status"],
  }));
}

export function createAuditHistoryFallback(): AuditHistoryRow[] {
  return auditHistoryMock;
}

export async function fetchAuditSummary(
  options?: FetchAuditSummaryOptions,
): Promise<AuditSummaryCard[]> {
  const baseUrl = getApiBaseUrl();

  if (baseUrl) {
    try {
      const payload = await fetchWithTimeout<AuditSummaryResponse>(
        `${baseUrl}/v1/audits/summary`,
        options?.signal,
      );
      if (payload) {
        return transformAuditSummary(payload);
      }
    } catch (error) {
      logFallback("summary", error);
    }
  }

  return createAuditSummaryFallback();
}

export async function fetchAuditQueue(
  options?: FetchAuditQueueOptions,
): Promise<AuditQueueCard[]> {
  const baseUrl = getApiBaseUrl();

  if (baseUrl) {
    try {
      const payload = await fetchWithTimeout<AuditQueueResponse>(
        `${baseUrl}/v1/audits/queue`,
        options?.signal,
      );
      if (payload) {
        return transformAuditQueue(payload);
      }
    } catch (error) {
      logFallback("queue", error);
    }
  }

  return createAuditQueueFallback();
}

export async function fetchAuditHistory(
  options?: FetchAuditHistoryOptions,
): Promise<AuditHistoryRow[]> {
  const baseUrl = getApiBaseUrl();

  if (baseUrl) {
    try {
      const payload = await fetchWithTimeout<AuditHistoryResponse>(
        `${baseUrl}/v1/audits/history`,
        options?.signal,
      );
      if (payload) {
        return transformAuditHistory(payload);
      }
    } catch (error) {
      logFallback("history", error);
    }
  }

  return createAuditHistoryFallback();
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

function transformAuditQueue(response: AuditQueueResponse): AuditQueueCard[] {
  return response.items.map((item) => ({
    id: item.id,
    project: item.project,
    type: item.type,
    status: STATUS_LABEL_MAP[item.status] ?? item.status,
    startedAt: formatQueueStartTime(item.started_at),
    eta: formatEta(item.eta_seconds),
  }));
}

function transformAuditHistory(response: AuditHistoryResponse): AuditHistoryRow[] {
  return response.items.map((item) => ({
    id: item.id,
    project: item.project,
    finishedAt: formatHistoryTimestamp(item.completed_at),
    score: item.score,
    criticalIssues: item.critical_issues,
    owner: item.owner,
  }));
}

async function fetchWithTimeout<T>(
  url: string,
  externalSignal?: AbortSignal,
): Promise<T | null> {
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
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
}

function logFallback(scope: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[fetchAudit${capitalize(scope)}] fallback to mocks`, error);
  }
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

function formatQueueStartTime(value: string | null): string {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return queueTimeFormatter.format(date);
}

function formatEta(seconds: number | null): string {
  if (seconds == null) {
    return "--";
  }

  const total = Math.max(0, seconds);
  const minutes = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const remaining = (total % 60).toString().padStart(2, "0");

  return `${minutes}:${remaining}`;
}

function formatHistoryTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const parts = historyDateFormatter.formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const monthRaw = parts.find((part) => part.type === "month")?.value ?? "";
  const month = capitalize(monthRaw.replace(".", ""));
  const time = historyTimeFormatter.format(date);

  return `${day} ${month} @ ${time}`.trim();
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
