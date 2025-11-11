import { planColumns, planTable, planVelocity } from "../mocks/plan";
import type { PlanColumn, PlanTableRow, PlanVelocityPoint } from "../mocks/types";

import { authHeaders } from "./http";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 5000;

export async function fetchPlanBoard(): Promise<PlanColumn[]> {
  if (!API_BASE_URL) return planColumns;
  try { return await getJson(`${API_BASE_URL}/v1/plan/board`); } catch { return planColumns; }
}
export async function fetchPlanTable(): Promise<PlanTableRow[]> {
  if (!API_BASE_URL) return planTable;
  try { return await getJson(`${API_BASE_URL}/v1/plan/table`); } catch { return planTable; }
}
export async function fetchPlanVelocity(): Promise<PlanVelocityPoint[]> {
  if (!API_BASE_URL) return planVelocity;
  try { return await getJson(`${API_BASE_URL}/v1/plan/velocity`); } catch { return planVelocity; }
}

async function getJson(url: string) {
  const c = new AbortController();
  const tid = setTimeout(() => c.abort(), REQUEST_TIMEOUT_MS);
  try { const r = await fetch(url, { signal: c.signal, headers: authHeaders() }); if (!r.ok) throw new Error(String(r.status)); return await r.json(); } finally { clearTimeout(tid); }
}

export async function createPlanItem(column: string, item: { title: string; impact: string; effort: string; owner: string; due: string }) {
  if (!API_BASE_URL) return null;
  const r = await fetch(`${API_BASE_URL}/v1/plan/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ column, item }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.json();
}

export async function updatePlanItem(id: string, patch: Partial<{ title: string; impact: string; effort: string; owner: string; due: string; column: string }>) {
  if (!API_BASE_URL) return null;
  const r = await fetch(`${API_BASE_URL}/v1/plan/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.json();
}

export async function deletePlanItem(id: string) {
  if (!API_BASE_URL) return null;
  const r = await fetch(`${API_BASE_URL}/v1/plan/items/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.json();
}
