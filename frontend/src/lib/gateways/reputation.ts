import { channelBreakdown, recentMentions, sentimentTimeline } from "../mocks/reputation";
import type { ChannelBreakdownItem, ReputationMention, SentimentTimelinePoint, KpiSummaryItem } from "../mocks/types";

const REQUEST_TIMEOUT_MS = 5000;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export async function fetchReputationSummary(): Promise<KpiSummaryItem[]> {
  if (!API_BASE_URL) return createSummaryFallback();
  try {
    const data = await getJson(`${API_BASE_URL}/v1/reputation/summary`);
    if (!Array.isArray(data)) throw new Error("bad payload");
    return data as KpiSummaryItem[];
  } catch (e) {
    return createSummaryFallback();
  }
}

export async function fetchReputationTimeline(): Promise<SentimentTimelinePoint[]> {
  if (!API_BASE_URL) return sentimentTimeline;
  try {
    const data = await getJson(`${API_BASE_URL}/v1/reputation/timeline`);
    return data as SentimentTimelinePoint[];
  } catch (e) {
    return sentimentTimeline;
  }
}

export async function fetchReputationChannels(): Promise<ChannelBreakdownItem[]> {
  if (!API_BASE_URL) return channelBreakdown;
  try {
    const data = await getJson(`${API_BASE_URL}/v1/reputation/channels`);
    return data as ChannelBreakdownItem[];
  } catch (e) {
    return channelBreakdown;
  }
}

export async function fetchReputationMentions(): Promise<ReputationMention[]> {
  if (!API_BASE_URL) return recentMentions;
  try {
    const data = await getJson(`${API_BASE_URL}/v1/reputation/mentions`);
    // map to frontend shape: publishedAt human readable
    return (data as any[]).map((m) => ({
      id: m.id,
      source: m.source,
      sentiment: m.sentiment,
      snippet: m.snippet,
      publishedAt: new Date(m.published_at).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
      reach: m.reach,
      action: m.action,
    }));
  } catch (e) {
    return recentMentions;
  }
}

function createSummaryFallback(): KpiSummaryItem[] {
  return [
    { label: "Reputation Score", value: "74 / 100", delta: "-5 semana", status: "watch", description: "Descenso por menciones negativas en foros especializados." },
    { label: "Alertas activas", value: "6", delta: "3 criticas", status: "risk", description: "Dos hilos en Reddit, una review G2 y tres post sociales pendientes." },
    { label: "Share de voz positivo", value: "42%", delta: "+8 vs. mes anterior", status: "good", description: "Campaña de PR generó 3 publicaciones con link a landing principal." },
  ];
}

async function getJson(url: string) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const r = await fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } finally {
    clearTimeout(tid);
  }
}

