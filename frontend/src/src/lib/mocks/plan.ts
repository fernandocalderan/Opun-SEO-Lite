import type { PlanColumn, PlanTableRow, PlanVelocityPoint } from "./types";

export const planColumns = [
  {
    title: "Pendiente",
    items: [
      {
        id: "plan-1",
        title: "Responder hilo criticamente negativo en Reddit",
        impact: "Alto",
        effort: "Medio",
        owner: "PR",
        due: "02 Nov",
      },
      {
        id: "plan-2",
        title: "Actualizar meta descriptions cluster ORM",
        impact: "Medio",
        effort: "Bajo",
        owner: "Content",
        due: "04 Nov",
      },
    ],
  },
  {
    title: "En progreso",
    items: [
      {
        id: "plan-3",
        title: "Implementar schema FAQ en landing principal",
        impact: "Alto",
        effort: "Medio",
        owner: "SEO Ops",
        due: "31 Oct",
      },
    ],
  },
  {
    title: "Listo para QA",
    items: [
      {
        id: "plan-4",
        title: "Publicar case study B2C para blog reputacional",
        impact: "Alto",
        effort: "Alto",
        owner: "Marketing",
        due: "03 Nov",
      },
    ],
  },
  {
    title: "Completado",
    items: [
      {
        id: "plan-5",
        title: "Configurar alertas Slack para menciones criticas",
        impact: "Alto",
        effort: "Bajo",
        owner: "DevOps",
        due: "29 Oct",
      },
    ],
  },
] satisfies PlanColumn[];

export const planTable = [
  {
    id: "plan-table-1",
    category: "SEO tecnico",
    task: "Corregir canonical duplicado en blog",
    impact: "Alto",
    effort: "Bajo",
    status: "En progreso",
    owner: "SEO Ops",
    due: "02 Nov",
  },
  {
    id: "plan-table-2",
    category: "Reputacion",
    task: "Activar alertas G2 en Zapier",
    impact: "Medio",
    effort: "Medio",
    status: "Pendiente",
    owner: "Ops",
    due: "05 Nov",
  },
  {
    id: "plan-table-3",
    category: "Contenido",
    task: "Outline serie de articulos defensivos",
    impact: "Alto",
    effort: "Alto",
    status: "Listo QA",
    owner: "Content",
    due: "07 Nov",
  },
] satisfies PlanTableRow[];

export const planVelocity = [
  { sprint: "Sprint 39", planned: 12, completed: 8 },
  { sprint: "Sprint 40", planned: 10, completed: 9 },
  { sprint: "Sprint 41", planned: 11, completed: 7 },
  { sprint: "Sprint 42", planned: 12, completed: 10 },
  { sprint: "Sprint 43", planned: 13, completed: 11 },
] satisfies PlanVelocityPoint[];
