import { ConfigurationState } from "@/modules/settings/types";

export const initialSettings: ConfigurationState = {
  project: {
    projectName: "Opun Reputation Watch",
    publicName: "Opun Intelligence",
    primaryUrl: "https://www.opun.example",
    relatedUrls: [
      "https://blog.opun.example",
      "https://status.opun.example"
    ],
    industries: ["SaaS", "Marketing Technology"],
    markets: ["Latam", "US"],
    objectives: [
      "Reforzar reputacion digital",
      "Incrementar share of voice SEO",
      "Optimizar respuesta ante crisis"
    ],
    stakeholders: [
      {
        name: "Valeria Rios",
        email: "valeria.rios@opun.example",
        responsibility: "Brand & PR",
        channel: "slack"
      },
      {
        name: "Jorge Diaz",
        email: "jorge.diaz@opun.example",
        responsibility: "SEO Lead",
        channel: "email"
      }
    ],
    slaMinutes: 90,
  },
  seo: {
    primaryKeywords: ["gestión reputación online", "auditoria seo automatizada"],
    secondaryKeywords: ["monitor de menciones", "alertas reputacionales", "seo intelligence"],
    negativeKeywords: ["gratis", "pirata"],
    competitorDomains: ["https://competidor1.example", "https://competidor2.example"],
    targetSerpFeatures: ["featured snippet", "top stories", "reviews"],
    crawlFrequency: "weekly",
    crawlDepth: "standard",
    monitoringRegions: ["México", "España", "Colombia"],
  },
  reputation: {
    topics: ["producto", "atencion", "innovacion"],
    hashtags: ["#OpunAI", "#OpunCare"],
    excludeTerms: ["ofertas de empleo", "broma"],
    channels: {
      social: true,
      forums: true,
      news: true,
      reviews: true,
      video: true,
      blogs: false,
    },
    sentimentCriticalThreshold: 35,
    sentimentWarningThreshold: 55,
    languages: ["es", "en"],
    customSources: ["https://podcastmarketing.example/rss"],
    escalationContacts: ["crisis@opun.example", "pr-team@opun.example"],
  },
  integrations: {
    twitter: true,
    facebook: true,
    instagram: false,
    linkedin: true,
    youtube: false,
    searchConsole: true,
    ga4: true,
    semrush: true,
    ahrefs: false,
    salesforce: false,
    hubspot: true,
    zendesk: true,
  },
  alerts: {
    volumeSpikeThreshold: 45,
    sentimentDropThreshold: 12,
    dailyDigest: true,
    weeklyExecutiveReport: true,
    realtimeSlackChannel: "#reputation-alerts",
    emailRecipients: ["alertas@opun.example", "equipo-pr@opun.example"],
    quietHours: {
      start: "22:00",
      end: "07:00",
    },
  },
  collaboration: {
    teams: ["SEO Squad", "Brand Studio", "Customer Success"],
    reviewerWorkflow: "Toda alerta critica requiere visto bueno de PR y Customer Success antes de publicarse.",
    sharedNotes: "Detalle aqui hallazgos clave o decisiones de gestion de crisis.",
  },
  governance: {
    dataRetentionDays: 365,
    anonymizePersonalData: true,
    piiNotes: "Se anonimiza automaticamente cualquier email o telefono encontrado en menciones.",
    legalAcknowledged: true,
  },
};
