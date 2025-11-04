export type SentimentPoint = { date: string; score: number; negative: number; positive: number };
export type ChannelItem = { channel: string; exposure: string; sentiment: string; share: string };
export type MentionItem = {
  id: string;
  source: string;
  sentiment: "negativo" | "neutral" | "positivo";
  snippet: string;
  published_at: string;
  reach: string;
  action: string;
};

export type ReputationStore = {
  summary: Array<{ label: string; value: string; delta: string; status: "good" | "watch" | "risk"; description: string }>;
  timeline: SentimentPoint[];
  channels: ChannelItem[];
  mentions: MentionItem[];
};

import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "reputation.json");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function fileExists(p: string) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function readStore(): Promise<ReputationStore> {
  await ensureDir();
  if (!(await fileExists(STORE_PATH))) {
    const seed: ReputationStore = {
      summary: [
        { label: "Reputation Score", value: "74 / 100", delta: "-5 semana", status: "watch", description: "Descenso por menciones negativas en foros especializados." },
        { label: "Alertas activas", value: "6", delta: "3 criticas", status: "risk", description: "Dos hilos en Reddit, una review G2 y tres post sociales pendientes." },
        { label: "Share de voz positivo", value: "42%", delta: "+8 vs. mes anterior", status: "good", description: "Campaña de PR generó publicaciones con link a landing principal." },
      ],
      timeline: [
        { date: "Oct 21", score: 68, negative: 4, positive: 12 },
        { date: "Oct 22", score: 71, negative: 3, positive: 15 },
        { date: "Oct 23", score: 66, negative: 7, positive: 11 },
        { date: "Oct 24", score: 74, negative: 2, positive: 17 },
        { date: "Oct 25", score: 70, negative: 5, positive: 14 },
        { date: "Oct 26", score: 64, negative: 8, positive: 9 },
        { date: "Oct 27", score: 72, negative: 3, positive: 19 },
      ],
      channels: [
        { channel: "SERP Top Stories", exposure: "Alta", sentiment: "positivo", share: "34%" },
        { channel: "Redes sociales", exposure: "Media", sentiment: "negativo", share: "27%" },
        { channel: "Foros especializados", exposure: "Alta", sentiment: "negativo", share: "21%" },
        { channel: "Reviews SaaS", exposure: "Media", sentiment: "neutral", share: "18%" },
      ],
      mentions: [
        { id: "mention-1", source: "Reddit / r/marketingops", sentiment: "negativo", snippet: "El soporte tarda en responder tickets enterprise, deberian ampliar SLA.", published_at: new Date().toISOString(), reach: "14k", action: "Coordenar respuesta con PR" },
        { id: "mention-2", source: "YouTube / Review canal TechSEO", sentiment: "positivo", snippet: "La automatizacion de auditorias es sobresaliente, agiliza la propuesta a clientes.", published_at: new Date().toISOString(), reach: "22k", action: "Compartir en newsletter y redes" },
        { id: "mention-3", source: "SERP / Blog industry", sentiment: "neutral", snippet: "Comparativa de plataformas ORM, Opun destaca por reportes pero faltan casos B2C.", published_at: new Date().toISOString(), reach: "9k", action: "Publicar caso de exito orientado a B2C" },
      ],
    };
    await fs.writeFile(STORE_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
  const raw = await fs.readFile(STORE_PATH, "utf8");
  return JSON.parse(raw) as ReputationStore;
}

export async function getReputationSummary() {
  const data = await readStore();
  return data.summary;
}
export async function getReputationTimeline() {
  const data = await readStore();
  return data.timeline;
}
export async function getReputationChannels() {
  const data = await readStore();
  return data.channels;
}
export async function getReputationMentions() {
  const data = await readStore();
  return data.mentions;
}
