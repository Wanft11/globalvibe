export type Channel = 'TikTok' | 'Instagram' | 'Reddit' | 'Website' | 'B2B Email';
export type Locale = 'en' | 'zh';
export interface ProductInput {
  description: string;
  image?: { src: string; name: string; demo?: boolean };
}
export interface ProductProfile {
  name: string;
  attributes: string[];
  source: 'demo' | 'text' | 'image';
}
export interface MarketProfile {
  id: string;
  name: string;
  zh: string;
  guidance: string;
}
export interface AudienceProfile {
  id: string;
  name: string;
  zh: string;
}
export interface LocalizationConfig {
  market: MarketProfile;
  audience: AudienceProfile;
  channels: Channel[];
}
export interface SellingPoint {
  id: string;
  original: string;
  literal: string;
  localized: string;
  highlight: string;
  reason: string;
}
export const riskDimensions = ['Language & Tone', 'Cultural Sensitivity', 'Marketing Claims', 'Visual Adaptation', 'Units & Localization'] as const;
export interface CulturalRisk {
  id: string;
  dimension: typeof riskDimensions[number];
  level: 'High' | 'Medium' | 'Low';
  original: string;
  explanation: string;
  recommendation: string;
}
export interface PlatformAsset {
  channel: Channel;
  sections: { label: string; text: string }[];
  visual?: { headline: string; benefits: string[]; cta: string };
}
export interface ConsumerPersona {
  id: string;
  name: string;
  profile: string;
  initials: string;
}
export interface ConsumerFeedback {
  persona: ConsumerPersona;
  comment: string;
  purchaseInterest: string;
  messageClarity: string;
  trustConcerns: string;
}
export interface ContentVersion {
  number: 1 | 2;
  source: 'mock' | 'getrun';
  sellingPoints: SellingPoint[];
  assets: PlatformAsset[];
  changes: string[];
}
export interface LocalizationResult {
  profile: ProductProfile;
  risks: CulturalRisk[];
  versions: ContentVersion[];
}
export type WorkflowState =
  | { status: 'empty' | 'ready' | 'analyzing' }
  | { status: 'generated'; result: LocalizationResult }
  | { status: 'testing' | 'feedback-ready' | 'refined'; result: LocalizationResult; feedback: ConsumerFeedback[] };
