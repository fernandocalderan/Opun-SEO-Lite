import type { PlanColumn, PlanTableRow, PlanVelocityPoint } from "../../frontend/src/lib/mocks/types";

export type PlanStore = {
  columns: PlanColumn[];
  table: PlanTableRow[];
  velocity: PlanVelocityPoint[];
};

import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "plan.json");

async function ensureDir() { await fs.mkdir(DATA_DIR, { recursive: true }); }
async function fileExists(p: string) { try { await fs.access(p); return true; } catch { return false; } }

async function readStore(): Promise<PlanStore> {
  await ensureDir();
  if (!(await fileExists(STORE_PATH))) {
    const seed: PlanStore = {
      columns: [
        {
          title: "Pendiente",
          items: [
            { id: "plan-1", title: "Responder hilo criticamente negativo en Reddit", impact: "Alto", effort: "Medio", owner: "PR", due: "02 Nov" },
            { id: "plan-2", title: "Actualizar meta descriptions cluster ORM", impact: "Medio", effort: "Bajo", owner: "Content", due: "04 Nov" },
          ],
        },
        { title: "En progreso", items: [{ id: "plan-3", title: "Implementar schema FAQ en landing principal", impact: "Alto", effort: "Medio", owner: "SEO Ops", due: "31 Oct" }] },
        { title: "Listo para QA", items: [{ id: "plan-4", title: "Publicar case study B2C para blog reputacional", impact: "Alto", effort: "Alto", owner: "Marketing", due: "03 Nov" }] },
        { title: "Completado", items: [{ id: "plan-5", title: "Configurar alertas Slack para menciones criticas", impact: "Alto", effort: "Bajo", owner: "DevOps", due: "29 Oct" }] },
      ],
      table: [
        { id: "plan-table-1", category: "SEO tecnico", task: "Corregir canonical duplicado en blog", impact: "Alto", effort: "Bajo", status: "En progreso", owner: "SEO Ops", due: "02 Nov" },
        { id: "plan-table-2", category: "Reputacion", task: "Activar alertas G2 en Zapier", impact: "Medio", effort: "Medio", status: "Pendiente", owner: "Ops", due: "05 Nov" },
        { id: "plan-table-3", category: "Contenido", task: "Outline serie de articulos defensivos", impact: "Alto", effort: "Alto", status: "Listo QA", owner: "Content", due: "07 Nov" },
      ],
      velocity: [
        { sprint: "Sprint 39", planned: 12, completed: 8 },
        { sprint: "Sprint 40", planned: 10, completed: 9 },
        { sprint: "Sprint 41", planned: 11, completed: 7 },
        { sprint: "Sprint 42", planned: 12, completed: 10 },
        { sprint: "Sprint 43", planned: 13, completed: 11 },
      ],
    };
    await fs.writeFile(STORE_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
  const raw = await fs.readFile(STORE_PATH, "utf8");
  return JSON.parse(raw) as PlanStore;
}

export async function getPlanBoard() {
  const data = await readStore();
  return data.columns;
}
export async function getPlanTable() {
  const data = await readStore();
  return data.table;
}
export async function getPlanVelocity() {
  const data = await readStore();
  return data.velocity;
}

export async function addPlanItem(columnTitle: string, item: { title: string; impact: string; effort: string; owner: string; due: string }) {
  const data = await readStore();
  const id = `plan-${Date.now()}`;
  const newItem = { id, ...item } as PlanColumn["items"][number];
  const col = data.columns.find((c) => c.title === columnTitle) ?? data.columns[0];
  col.items.unshift(newItem);
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
  return newItem;
}

export async function updatePlanItem(id: string, patch: Partial<{ title: string; impact: string; effort: string; owner: string; due: string; column: string }>) {
  const data = await readStore();
  let fromColIdx = -1, itemIdx = -1;
  data.columns.forEach((col, ci) => {
    const idx = col.items.findIndex((it) => it.id === id);
    if (idx >= 0) { fromColIdx = ci; itemIdx = idx; }
  });
  if (fromColIdx < 0) return undefined;
  const item = data.columns[fromColIdx].items[itemIdx];
  const updated = { ...item, ...patch } as PlanColumn["items"][number];
  // move column if needed
  if (patch.column && patch.column !== data.columns[fromColIdx].title) {
    data.columns[fromColIdx].items.splice(itemIdx, 1);
    const to = data.columns.find((c) => c.title === patch.column) ?? data.columns[0];
    to.items.unshift(updated);
  } else {
    data.columns[fromColIdx].items[itemIdx] = updated;
  }
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
  return updated;
}

export async function deletePlanItem(id: string) {
  const data = await readStore();
  let removed: PlanColumn["items"][number] | undefined;
  data.columns.forEach((col) => {
    const idx = col.items.findIndex((it) => it.id === id);
    if (idx >= 0) {
      removed = col.items[idx];
      col.items.splice(idx, 1);
    }
  });
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
  return removed;
}
