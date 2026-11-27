export type Channel = 'TikTok' | 'Instagram' | 'Reddit' | 'Website' | 'B2B Email';
export type Locale = 'en' | 'zh';
export type VisualTheme = 'indigo' | 'travertine' | 'obsidian';
export type DemoCaseId = 'powerbank' | 'beauty' | 'coffee';
export type AiMode = 'live' | 'mock';

export interface ProductImage {
  src: string;
  cleanSrc?: string;
  dataUrl?: string;
  name: string;
  demo?: DemoCaseId;
}

export interface ProductInput {
  description: string;
  image?: ProductImage;
}

export interface ProductProfile {
  name: string;
  nameZh?: string;
  attributes: string[];
  source: 'demo' | 'text' | 'image';
  demoId?: DemoCaseId;
}

export interface MarketProfile {
  id: string;
  name: string;
  zh: string;
  guidance: string;
  guidanceZh: string;
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
  reasonZh?: string;
}

export const riskDimensions = [
  'Language & Tone',
  'Cultural Sensitivity',
  'Marketing Claims',
  'Visual Adaptation',
  'Units & Localization',
] as const;

export interface CulturalRisk {
  id: string;
  dimension: typeof riskDimensions[number];
  level: 'High' | 'Medium' | 'Low';
  original: string;
  explanation: string;
  explanationZh?: string;
  recommendation: string;
  recommendationZh?: string;
}

export interface PlatformAsset {
  channel: Channel;
  sections: { label: string; text: string }[];
  visual?: { headline: string; benefits: string[]; cta: string };
  culturalNotes?: string[];
  culturalNotesZh?: string[];
}

export interface ConsumerPersona {
  id: string;
  name: string;
  profile: string;
  profileZh?: string;
  initials: string;
}

export interface ConsumerFeedback {
  persona: ConsumerPersona;
  comment: string;
  commentZh?: string;
  purchaseInterest: string;
  purchaseInterestZh?: string;
  messageClarity: string;
  messageClarityZh?: string;
  trustConcerns: string;
  trustConcernsZh?: string;
}

export interface ContentVersion {
  number: 1 | 2;
  source: 'mock' | 'getrun';
  sellingPoints: SellingPoint[];
  assets: PlatformAsset[];
  changes: string[];
  changesZh?: string[];
}

export interface ZhihuReference {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  author: string;
  authorBadge?: string;
  contentType: 'Answer' | 'Article' | 'Post';
  voteUpCount: number;
  commentCount: number;
  authorityLevel?: string;
}

export interface ZhihuInsightPack {
  source: 'live' | 'fallback';
  degradedReason?: 'unconfigured' | 'credentials' | 'quota' | 'empty' | 'upstream';
  activeQuery: string;
  suggestedQueries: string[];
  items: ZhihuReference[];
  zhidaBrief?: string;
  zhidaLocale?: Locale;
  zhidaSource?: 'live' | 'fallback';
}

export interface LocalizationResult {
  profile: ProductProfile;
  config: LocalizationConfig;
  image?: ProductImage;
  risks: CulturalRisk[];
  versions: ContentVersion[];
}

export type WorkflowState =
  | { status: 'empty' | 'ready' | 'analyzing' }
  | { status: 'creating'; result: LocalizationResult }
  | { status: 'generated'; result: LocalizationResult }
  | { status: 'testing' | 'feedback-ready' | 'refined'; result: LocalizationResult; feedback: ConsumerFeedback[] };
