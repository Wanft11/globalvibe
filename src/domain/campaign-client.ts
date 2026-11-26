import type {
  ConsumerFeedback,
  ContentVersion,
  CulturalRisk,
  Locale,
  LocalizationConfig,
  PlatformAsset,
  ProductInput,
  ProductProfile,
  SellingPoint,
} from './types';

export class CampaignError extends Error {}

export interface GetRunStatus {
  configured: boolean;
  model: string | null;
}

export async function checkGetRunStatus(): Promise<GetRunStatus> {
  try {
    const response = await fetch('/api/campaign', { method: 'GET', cache: 'no-store' });
    if (!response.ok) return { configured: false, model: null };
    const data = (await response.json()) as Partial<GetRunStatus>;
    return { configured: Boolean(data.configured), model: data.model ?? null };
  } catch {
    return { configured: false, model: null };
  }
}

async function postStage<T>(body: Record<string, unknown>, signal: AbortSignal): Promise<T | null> {
  const response = await fetch('/api/campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  const data = (await response.json().catch(() => ({}))) as { result?: T | null; error?: string };
  if (!response.ok) throw new CampaignError(data.error ?? 'upstream');
  return data.result ?? null;
}

export async function runGetRunDiagnose(
  input: ProductInput,
  points: SellingPoint[],
  config: LocalizationConfig,
  locale: Locale,
  signal: AbortSignal,
): Promise<{
  profile: ProductProfile;
  risks: CulturalRisk[];
  sellingPoints: SellingPoint[];
} | null> {
  const res = await postStage<{
    productName: string;
    productNameZh?: string;
    attributes: string[];
    risks: CulturalRisk[];
    sellingPoints: Array<{
      literal?: string;
      localized: string;
      highlight: string;
      reason: string;
      reasonZh?: string;
    }>;
  }>(
    {
      stage: 'diagnose',
      locale,
      market: config.market.name,
      audience: config.audience.name,
      channels: config.channels,
      description: input.description.trim() || 'Product image localization brief',
      points: points.map(({ original, literal }) => ({ original, literal })),
      imageDataUrl: input.image?.dataUrl,
    },
    signal,
  );
  if (!res) return null;

  return {
    profile: {
      name: res.productName,
      ...(res.productNameZh ? { nameZh: res.productNameZh } : {}),
      attributes: res.attributes,
      source: input.image && !input.description.trim() ? 'image' : 'text',
      demoId: input.image?.demo,
    },
    risks: res.risks,
    sellingPoints: points.map((point, i) => {
      const updated = res.sellingPoints[i];
      return {
        ...point,
        literal: updated.literal || point.literal,
        localized: updated.localized,
        highlight: updated.highlight,
        reason: updated.reason,
        ...(updated.reasonZh ? { reasonZh: updated.reasonZh } : {}),
      };
    }),
  };
}

export async function runGetRunChannels(
  profile: ProductProfile,
  description: string,
  sellingPoints: SellingPoint[],
  config: LocalizationConfig,
  locale: Locale,
  signal: AbortSignal,
): Promise<PlatformAsset[] | null> {
  const res = await postStage<{ assets: PlatformAsset[] }>(
    {
      stage: 'channels',
      locale,
      market: config.market.name,
      audience: config.audience.name,
      channels: config.channels,
      productName: profile.name,
      description: description.trim() || profile.name,
      points: sellingPoints.map(({ original, localized }) => ({ original, localized })),
    },
    signal,
  );
  return res?.assets ?? null;
}

export async function runGetRunFocusGroup(
  profile: ProductProfile,
  version: ContentVersion,
  config: LocalizationConfig,
  locale: Locale,
  signal: AbortSignal,
): Promise<ConsumerFeedback[] | null> {
  const primaryAsset =
    version.assets.find(a => config.channels.includes(a.channel)) ?? version.assets[0];
  const sampleCopy = primaryAsset
    ? `${primaryAsset.channel}: ${primaryAsset.sections.map(s => `${s.label}: ${s.text}`).join(' | ')}`
    : version.sellingPoints.map(p => p.localized).join(' | ');

  const res = await postStage<{ feedback: ConsumerFeedback[] }>(
    {
      stage: 'focus-group',
      locale,
      market: config.market.name,
      audience: config.audience.name,
      productName: profile.name,
      sellingPoints: version.sellingPoints.map(p => p.localized),
      sampleCopy: sampleCopy.slice(0, 2000),
    },
    signal,
  );
  return res?.feedback ?? null;
}

export async function runGetRunRefine(
  profile: ProductProfile,
  previous: ContentVersion,
  feedback: ConsumerFeedback[],
  config: LocalizationConfig,
  locale: Locale,
  signal: AbortSignal,
): Promise<ContentVersion | null> {
  const res = await postStage<{
    sellingPoints: Array<{ localized: string; highlight: string; reason: string; reasonZh?: string }>;
    assets: PlatformAsset[];
    changes: string[];
    changesZh?: string[];
  }>(
    {
      stage: 'refine',
      locale,
      market: config.market.name,
      audience: config.audience.name,
      channels: config.channels,
      productName: profile.name,
      points: previous.sellingPoints.map(({ original, literal, localized }) => ({
        original,
        literal,
        localized,
      })),
      feedback: feedback.map(
        item => `${item.persona.profile}: "${item.comment}" | Trust concern: ${item.trustConcerns}`,
      ),
    },
    signal,
  );
  if (!res) return null;

  return {
    number: 2,
    source: 'getrun',
    sellingPoints: previous.sellingPoints.map((point, i) => {
      const sp = res.sellingPoints[i];
      return {
        ...point,
        localized: sp.localized,
        highlight: sp.highlight,
        reason: sp.reason,
        ...(sp.reasonZh ? { reasonZh: sp.reasonZh } : {}),
      };
    }),
    assets: res.assets,
    changes: res.changes,
    ...(res.changesZh ? { changesZh: res.changesZh } : {}),
  };
}
