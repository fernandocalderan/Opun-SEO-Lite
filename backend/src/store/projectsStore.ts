import { promises as fs } from "node:fs";
import path from "node:path";

export type Project = {
  id: string;
  name: string;
  primary_url: string;
  keywords: string[];
  monitoring_enabled: boolean;
  schedule: "none" | "hourly" | "daily" | "weekly" | "monthly";
  last_audit_at: string | null;
};

type ProjectsData = { projects: Project[] };

const DATA_DIR = path.resolve(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "projects.json");

async function ensureDir() { await fs.mkdir(DATA_DIR, { recursive: true }); }
async function exists(p: string) { try { await fs.access(p); return true; } catch { return false; } }

async function readStore(): Promise<ProjectsData> {
  await ensureDir();
  if (!(await exists(STORE_PATH))) {
    const seed: ProjectsData = { projects: [] };
    await fs.writeFile(STORE_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
  const raw = await fs.readFile(STORE_PATH, "utf8");
  return JSON.parse(raw) as ProjectsData;
}

async function writeStore(data: ProjectsData) {
  await ensureDir();
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function listProjects() {
  const d = await readStore();
  return d.projects;
}

export async function createProject(input: { name: string; primary_url: string; keywords?: string[]; monitoring_enabled?: boolean; schedule?: Project["schedule"] }) {
  const d = await readStore();
  const id = `proj-${Date.now()}`;
  const proj: Project = {
    id,
    name: input.name,
    primary_url: input.primary_url,
    keywords: input.keywords ?? [],
    monitoring_enabled: input.monitoring_enabled ?? false,
    schedule: input.schedule ?? "none",
    last_audit_at: null,
  };
  d.projects.push(proj);
  await writeStore(d);
  return proj;
}

export async function updateProject(id: string, patch: Partial<Omit<Project, "id">>) {
  const d = await readStore();
  const idx = d.projects.findIndex((p) => p.id === id);
  if (idx < 0) return undefined;
  d.projects[idx] = { ...d.projects[idx], ...patch };
  await writeStore(d);
  return d.projects[idx];
}

export async function deleteProject(id: string) {
  const d = await readStore();
  const before = d.projects.length;
  d.projects = d.projects.filter((p) => p.id !== id);
  await writeStore(d);
  return d.projects.length < before;
}

export async function getSchedulableProjects() {
  const d = await readStore();
  const now = Date.now();
  const byCadence: Record<Project["schedule"], number> = {
    none: Infinity,
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
  };
  return d.projects.filter((p) => {
    if (!p.monitoring_enabled || p.schedule === "none") return false;
    const last = p.last_audit_at ? Date.parse(p.last_audit_at) : 0;
    return now - last >= (byCadence[p.schedule] || Infinity);
  });
}

export async function markProjectAudited(id: string) {
  await updateProject(id, { last_audit_at: new Date().toISOString() });
}

