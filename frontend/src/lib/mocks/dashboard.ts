import type {
  InsightItem,
  KpiSummaryItem,
  OverviewNarrative,
  ReputationAlert,
} from "./types";

export const kpiSummary = [
  {
    label: "SEO Health",
    value: "82 / 100",
    delta: "+6 vs. last sprint",
    status: "good",
    description: "Auditoria tecnica estable; se detectaron 3 issues criticos pendientes.",
  },
  {
    label: "Reputation Score",
    value: "74",
    delta: "-5 ultima semana",
    status: "watch",
    description:
      "Caida en SERP page 1 por menciones negativas en foros especializados.",
  },
  {
    label: "CTR Brand Search",
    value: "3.4%",
    delta: "-1.2pp vs. benchmark",
    status: "risk",
    description: "Faltan rich snippets y copy consistente en title/meta.",
  },
] satisfies KpiSummaryItem[];

export const reputationAlerts = [
  {
    id: "alert-1",
    channel: "Foro / Reddit",
    source: "r/soporte-opun",
    summary:
      "Hilo cuestiona tiempos de respuesta del equipo de soporte; 12 comentarios negativos en 24h.",
    sentiment: "negative",
    publishedAt: "Hace 4 horas",
    url: "https://reddit.com",
  },
  {
    id: "alert-2",
    channel: "SERP / Top Stories",
    source: "news.google.com",
    summary:
      "Blog especializado destaca la nueva funcion IA con tono positivo; oportunidad para amplificar.",
    sentiment: "positive",
    publishedAt: "Hace 9 horas",
    url: "https://news.google.com",
  },
  {
    id: "alert-3",
    channel: "Reviews / G2",
    source: "g2.com/app/opun",
    summary:
      "Review 3 estrellas menciona onboarding complejo. Sugiere reforzar tutoriales iniciales.",
    sentiment: "neutral",
    publishedAt: "Hace 1 dia",
    url: "https://www.g2.com",
  },
] satisfies ReputationAlert[];

export const keyInsights = [
  {
    title: "Mencion negativa escala en foros",
    context:
      "El hilo mas activo en Reddit concentra el 65% del sentimiento negativo semanal. Usuarios citan desconocimiento del nuevo SLA.",
    recommendation:
      "Coordinar respuesta oficial con PR, actualizar FAQs y compartir tutorial en Slack comunidad.",
    severity: "critical",
    source: "Monitor ORM",
  },
  {
    title: "Opportunity: nuevo review positivo en medios",
    context:
      "Un medio especializado destaco la velocidad de despliegue de features. Todavia no se comparte en social corporativo.",
    recommendation:
      "Activar snippet social con quote destacado y enlazarlo en newsletter del viernes.",
    severity: "medium",
    source: "SERP Watch",
  },
] satisfies InsightItem[];

export const overviewNarrative = {
  headline: "Estrategia en progreso",
  summary:
    "Objetivo Sprint: estabilizar reputacion en foros especializados y recuperar 10% de CTR en brand search. El backend debera suministrar datos de tendencias y ownership de tareas.",
  updatedAt: "2025-10-31T14:00:00Z",
} satisfies OverviewNarrative;
