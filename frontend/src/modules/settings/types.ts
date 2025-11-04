export type Stakeholder = {
  name: string;
  email: string;
  responsibility: string;
  channel: "email" | "slack" | "sms" | "teams" | "";
};

export type ProjectProfile = {
  projectName: string;
  publicName: string;
  primaryUrl: string;
  relatedUrls: string[];
  industries: string[];
  markets: string[];
  objectives: string[];
  stakeholders: Stakeholder[];
  slaMinutes: number | "";
};

export type SeoSettings = {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  negativeKeywords: string[];
  competitorDomains: string[];
  targetSerpFeatures: string[];
  crawlFrequency: "daily" | "weekly" | "monthly" | "quarterly";
  crawlDepth: "shallow" | "standard" | "deep";
  monitoringRegions: string[];
};

export type ChannelPreferences = {
  social: boolean;
  forums: boolean;
  news: boolean;
  reviews: boolean;
  video: boolean;
  blogs: boolean;
};

export type ReputationSettings = {
  topics: string[];
  hashtags: string[];
  excludeTerms: string[];
  channels: ChannelPreferences;
  sentimentCriticalThreshold: number | "";
  sentimentWarningThreshold: number | "";
  languages: string[];
  customSources: string[];
  escalationContacts: string[];
};

export type IntegrationsSettings = {
  twitter: boolean;
  facebook: boolean;
  instagram: boolean;
  linkedin: boolean;
  youtube: boolean;
  searchConsole: boolean;
  ga4: boolean;
  semrush: boolean;
  ahrefs: boolean;
  salesforce: boolean;
  hubspot: boolean;
  zendesk: boolean;
};

export type AlertingSettings = {
  volumeSpikeThreshold: number | "";
  sentimentDropThreshold: number | "";
  dailyDigest: boolean;
  weeklyExecutiveReport: boolean;
  realtimeSlackChannel: string;
  emailRecipients: string[];
  quietHours: {
    start: string;
    end: string;
  };
};

export type CollaborationSettings = {
  teams: string[];
  reviewerWorkflow: string;
  sharedNotes: string;
};

export type DataGovernanceSettings = {
  dataRetentionDays: number | "";
  anonymizePersonalData: boolean;
  piiNotes: string;
  legalAcknowledged: boolean;
};

export type ConfigurationState = {
  project: ProjectProfile;
  seo: SeoSettings;
  reputation: ReputationSettings;
  integrations: IntegrationsSettings;
  alerts: AlertingSettings;
  collaboration: CollaborationSettings;
  governance: DataGovernanceSettings;
};
