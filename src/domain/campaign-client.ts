import type { ConsumerFeedback, ContentVersion, LocalizationConfig, PlatformAsset, SellingPoint } from './types';

export class CampaignError extends Error {}

interface Campaign {
  sellingPoints: Pick<SellingPoint, 'localized' | 'reason' | 'highlight'>[];
  assets: PlatformAsset[];
  changes: string[];
}

export async function generateCampaign(
  points: SellingPoint[],
  config: LocalizationConfig,
  signal: AbortSignal,
  feedback?: ConsumerFeedback[],
): Promise<ContentVersion | null> {
  const response = await fetch('/api/campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      market: config.market.name, audience: config.audience.name, channels: config.channels,
      points: points.map(({ original, literal, localized }) => ({
        original, literal, localized: feedback ? localized : undefined,
      })),
      feedback: feedback?.map(item => `${item.persona.profile}: ${item.comment} Concern: ${item.trustConcerns}`),
    }),
    signal,
  });
  const data: { campaign?: Campaign | null; error?: string } = await response.json();
  if (!response.ok) throw new CampaignError(data.error ?? 'upstream');
  if (!data.campaign) return null;
  const { assets, changes, sellingPoints } = data.campaign;
  return {
    number: feedback ? 2 : 1,
    source: 'getrun',
    sellingPoints: points.map((point, i) => {
      const { localized, reason, highlight } = sellingPoints[i];
      return { ...point, localized, reason, highlight: highlight && localized.includes(highlight) ? highlight : '' };
    }),
    assets,
    changes,
  };
}
