export const sentimentTimeline = [
  { date: "Oct 21", score: 68, negative: 4, positive: 12 },
  { date: "Oct 22", score: 71, negative: 3, positive: 15 },
  { date: "Oct 23", score: 66, negative: 7, positive: 11 },
  { date: "Oct 24", score: 74, negative: 2, positive: 17 },
  { date: "Oct 25", score: 70, negative: 5, positive: 14 },
  { date: "Oct 26", score: 64, negative: 8, positive: 9 },
  { date: "Oct 27", score: 72, negative: 3, positive: 19 },
];

export const channelBreakdown = [
  {
    channel: "SERP Top Stories",
    exposure: "Alta",
    sentiment: "positivo",
    share: "34%",
  },
  {
    channel: "Redes sociales",
    exposure: "Media",
    sentiment: "negativo",
    share: "27%",
  },
  {
    channel: "Foros especializados",
    exposure: "Alta",
    sentiment: "negativo",
    share: "21%",
  },
  {
    channel: "Reviews SaaS",
    exposure: "Media",
    sentiment: "neutral",
    share: "18%",
  },
];

export const recentMentions = [
  {
    id: "mention-1",
    source: "Reddit / r/marketingops",
    sentiment: "negativo",
    snippet:
      "El soporte tarda en responder tickets enterprise, deberian ampliar SLA.",
    publishedAt: "Hace 2h",
    reach: "14k",
    action: "Coordinar respuesta con PR",
  },
  {
    id: "mention-2",
    source: "YouTube / Review canal TechSEO",
    sentiment: "positivo",
    snippet:
      "La automatizacion de auditorias es sobresaliente, agiliza la propuesta a clientes.",
    publishedAt: "Hace 6h",
    reach: "22k",
    action: "Compartir en newsletter y redes",
  },
  {
    id: "mention-3",
    source: "SERP / Blog industry",
    sentiment: "neutral",
    snippet:
      "Comparativa de plataformas ORM, Opun destaca por reportes pero faltan casos B2C.",
    publishedAt: "Hace 11h",
    reach: "9k",
    action: "Publicar caso de exito orientado a B2C",
  },
];
