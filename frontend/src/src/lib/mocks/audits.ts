export const auditSummary = [
  { label: "Auditorias completadas", value: "128", delta: "+18 mes" },
  { label: "Tiempo promedio", value: "12m 40s", delta: "-2m vs. objetivo" },
  { label: "Issues criticos", value: "7", delta: "3 abiertos" },
];

export const auditQueue = [
  {
    id: "queue-1",
    project: "Brand / Landing principal",
    type: "Full crawl",
    status: "En ejecucion",
    startedAt: "16:20",
    eta: "00:05",
  },
  {
    id: "queue-2",
    project: "Blog / Cluster ORM",
    type: "Contenido",
    status: "Pendiente",
    startedAt: "--",
    eta: "--",
  },
  {
    id: "queue-3",
    project: "Ecommerce / fichas producto",
    type: "Performance",
    status: "Pendiente",
    startedAt: "--",
    eta: "--",
  },
];

export const auditHistory = [
  {
    id: "hist-1",
    project: "Brand / Landing principal",
    finishedAt: "30 Oct · 15:54",
    score: 84,
    criticalIssues: 2,
    owner: "SEO Ops",
  },
  {
    id: "hist-2",
    project: "Blog / Cluster ORM",
    finishedAt: "29 Oct · 10:12",
    score: 78,
    criticalIssues: 4,
    owner: "Content",
  },
  {
    id: "hist-3",
    project: "Knowledge base",
    finishedAt: "28 Oct · 18:41",
    score: 88,
    criticalIssues: 1,
    owner: "Support",
  },
];
