import { planColumns, planTable, planVelocity } from "../mocks/plan";
import type { PlanColumn, PlanTableRow, PlanVelocityPoint } from "../mocks/types";

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
  try { const r = await fetch(url, { signal: c.signal }); if (!r.ok) throw new Error(String(r.status)); return await r.json(); } finally { clearTimeout(tid); }
}

