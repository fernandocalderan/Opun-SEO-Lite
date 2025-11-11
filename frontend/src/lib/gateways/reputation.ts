import { channelBreakdown, recentMentions, sentimentTimeline } from "../mocks/reputation";
import type { ChannelBreakdownItem, ReputationMention, SentimentTimelinePoint, KpiSummaryItem } from "../mocks/types";

export type RankRow = { keyword: string; status: "found" | "not_found"; position: number | null; found_url: string | null };

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

type MentionsApi = Array<{
  id: string;
  source: string;
  sentiment: "positivo" | "negativo" | "neutral";
  snippet: string;
  published_at: string;
  reach: string;
  action: string;
}>;

export async function fetchReputationMentions(): Promise<ReputationMention[]> {
  if (!API_BASE_URL) return recentMentions;
  try {
    const data = (await getJson(`${API_BASE_URL}/v1/reputation/mentions`)) as MentionsApi;
    // map to frontend shape: publishedAt human readable
    return data.map((m) => ({
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

// Keyword rank quick lookup — API if available, otherwise mock
export async function fetchKeywordRanks(domain: string, keywords: string[]): Promise<RankRow[]> {
  const cleanDomain = (domain || "").trim();
  const list = (keywords || []).map((k) => k.trim()).filter(Boolean);
  if (!cleanDomain || list.length === 0) return [];

  if (API_BASE_URL) {
    try {
      const params = new URLSearchParams();
      params.set("domain", cleanDomain);
      for (const kw of list) params.append("kw", kw);
      const data = await getJson(`${API_BASE_URL}/v1/reputation/ranks?${params.toString()}`);
      // Expect array of { keyword, status, position, found_url }
      if (Array.isArray(data)) return data as RankRow[];
    } catch {
      // fall through to mock
    }
  }

  // Mock deterministic positions by hashing keyword
  const baseUrl = normalizeDomainToUrl(cleanDomain);
  return list.map((kw) => {
    const hash = Array.from(kw).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const found = hash % 3 !== 0; // ~66% found
    const pos = found ? (hash % 20) + 1 : null; // 1..20
    return {
      keyword: kw,
      status: found ? "found" : "not_found",
      position: pos,
      found_url: found ? `${baseUrl}/${slugify(kw)}` : null,
    } as RankRow;
  });
}

function normalizeDomainToUrl(input: string) {
  try {
    const u = new URL(input.includes("http") ? input : `https://${input}`);
    return `${u.origin}`;
  } catch {
    return `https://${input.replace(/\/$/, "")}`;
  }
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
