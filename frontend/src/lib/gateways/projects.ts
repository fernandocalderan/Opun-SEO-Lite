import { authHeaders } from "./http";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export type Project = {
  id: string;
  name: string;
  primary_url: string;
  keywords: string[];
  monitoring_enabled: boolean;
  schedule: "none" | "hourly" | "daily" | "weekly" | "monthly";
  last_audit_at: string | null;
};

export async function fetchProjects(): Promise<Project[]> {
  if (!API_BASE_URL) return [];
  const r = await fetch(`${API_BASE_URL}/v1/projects`, { headers: authHeaders() });
  if (!r.ok) return [];
  return (await r.json()) as Project[];
}

export async function createProject(payload: { name: string; primary_url: string; keywords?: string[]; monitoring_enabled?: boolean; schedule?: Project["schedule"] }) {
  if (!API_BASE_URL) return null;
  const r = await fetch(`${API_BASE_URL}/v1/projects`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()) as Project;
}

export async function updateProject(id: string, patch: Partial<Omit<Project, "id">>) {
  if (!API_BASE_URL) return null;
  const r = await fetch(`${API_BASE_URL}/v1/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(patch) });
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()) as Project;
}

export async function deleteProject(id: string) {
  if (!API_BASE_URL) return null;
  const r = await fetch(`${API_BASE_URL}/v1/projects/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!r.ok) throw new Error(String(r.status));
  return true;
}
