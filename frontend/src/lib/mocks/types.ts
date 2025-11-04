export type KpiStatus = "good" | "watch" | "risk";

export type SentimentTone = "positive" | "negative" | "neutral";

export interface KpiSummaryItem {
  label: string;
  value: string;
  delta: string;
  status: KpiStatus;
  description: string;
}

export interface ReputationAlert {
  id: string;
  channel: string;
  source: string;
  summary: string;
  sentiment: SentimentTone;
  publishedAt: string;
  publishedAtIso?: string;
  url: string;
}

export interface InsightItem {
  title: string;
  context: string;
  recommendation: string;
  severity: "critical" | "high" | "medium" | "low";
  source: string;
}

export interface OverviewNarrative {
  headline: string;
  summary: string;
  updatedAt: string;
}

export interface AuditSummaryItem {
  label: string;
  value: string;
  delta: string;
}

export interface AuditQueueItem {
  id: string;
  project: string;
  type: string;
  status: string;
  startedAt: string;
  eta: string;
}

export interface AuditHistoryItem {
  id: string;
  project: string;
  finishedAt: string;
  score: number;
  criticalIssues: number;
  owner: string;
}

export interface AuditPerformancePoint {
  id: string;
  project: string;
  completedAt: string;
  score: number;
  criticalIssues: number;
  durationSeconds?: number;
}

export interface SentimentTimelinePoint {
  date: string;
  score: number;
  negative: number;
  positive: number;
}

export interface ChannelBreakdownItem {
  channel: string;
  exposure: string;
  sentiment: "positivo" | "negativo" | "neutral";
  share: string;
}

export interface ReputationMention {
  id: string;
  source: string;
  sentiment: "negativo" | "neutral" | "positivo";
  snippet: string;
  publishedAt: string;
  reach: string;
  action: string;
}

export interface PlanColumnItem {
  id: string;
  title: string;
  impact: string;
  effort: string;
  owner: string;
  due: string;
}

export interface PlanColumn {
  title: string;
  items: PlanColumnItem[];
}

export interface PlanTableRow {
  id: string;
  category: string;
  task: string;
  impact: string;
  effort: string;
  status: string;
  owner: string;
  due: string;
}

export interface PlanVelocityPoint {
  sprint: string;
  planned: number;
  completed: number;
}

export interface ReportListItem {
  id: string;
  title: string;
  project: string;
  generatedAt: string;
  format: string;
  status: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
}

export interface ReportActivityPoint {
  date: string;
  generated: number;
  shared: number;
}
