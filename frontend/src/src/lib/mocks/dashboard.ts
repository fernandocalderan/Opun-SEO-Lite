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
];

export const reputationAlerts = [
  {
    id: "alert-1",
    channel: "Foro / Reddit",
    summary:
      "Hilo cuestiona tiempos de respuesta del equipo de soporte; 12 comentarios negativos en 24h.",
    sentiment: "negative",
    publishedAt: "Hace 4 horas",
    url: "https://reddit.com",
  },
  {
    id: "alert-2",
    channel: "SERP / Top Stories",
    summary:
      "Blog especializado destaca la nueva funcion IA con tono positivo; oportunidad para amplificar.",
    sentiment: "positive",
    publishedAt: "Hace 9 horas",
    url: "https://news.google.com",
  },
  {
    id: "alert-3",
    channel: "Reviews / G2",
    summary:
      "Review 3 estrellas menciona onboarding complejo. Sugiere reforzar tutoriales iniciales.",
    sentiment: "neutral",
    publishedAt: "Hace 1 dia",
    url: "https://www.g2.com",
  },
];

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
];
