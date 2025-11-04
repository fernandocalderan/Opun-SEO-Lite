import { promises as fs } from "node:fs";
import path from "node:path";

export type QueueStatus = "running" | "pending" | "completed" | "failed";

export interface QueueItem {
  id: string;
  project: string;
  type: string;
  status: QueueStatus;
  started_at: string | null;
  eta_seconds: number | null;
  url?: string;
  keywords?: string[];
}

export interface HistoryItem {
  id: string;
  project: string;
  completed_at: string;
  score: number;
  critical_issues: number;
  owner: string;
}

export interface PerformancePoint {
  id: string;
  project: string;
  completed_at: string;
  score: number;
  critical_issues: number;
  duration_seconds: number;
}

export interface SummaryData {
  overall_score: number;
  critical_issues: number;
  warnings: number;
  opportunities: number;
  last_run: string;
}

export interface AuditsStoreData {
  queue: QueueItem[];
  history: HistoryItem[];
  performance: PerformancePoint[];
  summary: SummaryData;
  results: Record<string, unknown>;
}

const DATA_DIR = path.resolve(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "audits.json");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function initStoreWithMocksIfNeeded(mocks: {
  queue: QueueItem[];
  history: HistoryItem[];
  performance: PerformancePoint[];
  summary: SummaryData;
}) {
  await ensureDir();
  const exists = await fileExists(STORE_PATH);
  const forceReset = process.env.NODE_ENV === "test";
  if (!exists || forceReset) {
    const initial: AuditsStoreData = {
      queue: [...mocks.queue],
      history: [...mocks.history],
      performance: [...mocks.performance],
      summary: { ...mocks.summary },
      results: {},
    };
    await fs.writeFile(STORE_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readStore(): Promise<AuditsStoreData> {
  await ensureDir();
  const exists = await fileExists(STORE_PATH);
  if (!exists) {
    const empty: AuditsStoreData = {
      queue: [],
      history: [],
      performance: [],
      summary: {
        overall_score: 0,
        critical_issues: 0,
        warnings: 0,
        opportunities: 0,
        last_run: new Date().toISOString(),
      },
      results: {},
    };
    await fs.writeFile(STORE_PATH, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
  const content = await fs.readFile(STORE_PATH, "utf8");
  return JSON.parse(content) as AuditsStoreData;
}

async function writeStore(data: AuditsStoreData) {
  await ensureDir();
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function getQueue() {
  const data = await readStore();
  return data.queue;
}

export async function getPendingQueue() {
  const data = await readStore();
  return data.queue.filter((q) => q.status === "pending");
}

export async function getHistory() {
  const data = await readStore();
  return data.history;
}

export async function getPerformance() {
  const data = await readStore();
  return data.performance;
}

export async function getSummary() {
  const data = await readStore();
  return data.summary;
}

export async function getStatusById(id: string): Promise<QueueItem | undefined> {
  const data = await readStore();
  return data.queue.find((q) => q.id === id);
}

export async function getResultById<T = unknown>(id: string): Promise<T | undefined> {
  const data = await readStore();
  return data.results[id] as T | undefined;
}

export async function createAudit(input: {
  project: string;
  type: string;
  url?: string;
  keywords?: string[];
}): Promise<QueueItem> {
  const data = await readStore();
  const id = `audit-${Date.now()}`;
  const item: QueueItem = {
    id,
    project: input.project,
    type: input.type,
    status: "pending",
    started_at: null,
    eta_seconds: null,
    url: input.url,
    keywords: input.keywords,
  };
  data.queue.unshift(item);
  await writeStore(data);
  return item;
}

export async function markRunning(id: string, etaSeconds: number) {
  const data = await readStore();
  const idx = data.queue.findIndex((q) => q.id === id);
  if (idx >= 0) {
    data.queue[idx] = {
      ...data.queue[idx],
      status: "running",
      started_at: new Date().toISOString(),
      eta_seconds: Math.max(0, Math.floor(etaSeconds)),
    };
    await writeStore(data);
    return data.queue[idx];
  }
  return undefined;
}

export async function markCompleted(
  id: string,
  result: {
    score: number;
    critical_issues: number;
    duration_seconds: number;
  },
  fullResult?: unknown,
) {
  const data = await readStore();
  const idx = data.queue.findIndex((q) => q.id === id);
  if (idx >= 0) {
    const item = data.queue[idx];
    data.queue[idx] = {
      ...item,
      status: "completed",
      eta_seconds: 0,
    };

    const completedAt = new Date().toISOString();
    const historyItem: HistoryItem = {
      id: id,
      project: item.project,
      completed_at: completedAt,
      score: result.score,
      critical_issues: result.critical_issues,
      owner: "SEO Ops",
    };
    data.history.unshift(historyItem);

    const perfPoint: PerformancePoint = {
      id: id,
      project: item.project,
      completed_at: completedAt,
      score: result.score,
      critical_issues: result.critical_issues,
      duration_seconds: result.duration_seconds,
    };
    data.performance.unshift(perfPoint);

    data.results[id] = fullResult ?? {
      id,
      project: item.project,
      completed_at: completedAt,
      score: result.score,
      critical_issues: result.critical_issues,
      summary: `Auditoria completada para ${item.project}`,
      recommendations: [
        "Optimiza meta descriptions en paginas con bajo CTR",
        "Mejora LCP en landing principal",
      ],
    };

    // Update summary last_run
    data.summary.last_run = completedAt;

    await writeStore(data);
    return data.queue[idx];
  }
  return undefined;
}

export async function markFailed(id: string, reason: string) {
  const data = await readStore();
  const idx = data.queue.findIndex((q) => q.id === id);
  if (idx >= 0) {
    data.queue[idx] = { ...data.queue[idx], status: "failed", eta_seconds: 0 };
    data.results[id] = { id, error: reason };
    await writeStore(data);
    return data.queue[idx];
  }
  return undefined;
}

export async function saveStoreDirect(data: AuditsStoreData) {
  await writeStore(data);
}
