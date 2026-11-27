import type {
  CulturalRisk,
  Locale,
  LocalizationConfig,
  ProductProfile,
  ZhihuInsightPack,
} from './types';

export async function fetchZhihuInsights(
  params: {
    profile: ProductProfile;
    description: string;
    config: LocalizationConfig;
    risks: CulturalRisk[];
    query?: string;
  },
  signal?: AbortSignal,
): Promise<ZhihuInsightPack | undefined> {
  const res = await fetch('/api/zhihu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stage: 'search',
      query: params.query,
      marketId: params.config.market.id,
      marketZh: params.config.market.zh,
      productNameZh: params.profile.nameZh ?? params.profile.name,
      description: params.description,
      channels: params.config.channels,
      risks: params.risks
        .filter(r => r.level === 'High' || r.level === 'Medium')
        .slice(0, 5)
        .map(r => ({ dimension: r.dimension, level: r.level, original: r.original })),
    }),
    signal,
  });

  if (!res.ok) return undefined;
  const data = (await res.json()) as { result?: ZhihuInsightPack };
  return data.result;
}

export async function fetchZhidaSummary(
  params: {
    locale: Locale;
    profile: ProductProfile;
    config: LocalizationConfig;
    risks: CulturalRisk[];
  },
  signal?: AbortSignal,
): Promise<{ summary: string; source: 'live' | 'fallback'; degradedReason?: string } | undefined> {
  const topRisks = params.risks
    .filter(r => r.level === 'High' || r.level === 'Medium')
    .slice(0, 3)
    .map(r =>
      params.locale === 'zh'
        ? `${r.original}（${r.recommendationZh ?? r.recommendation}）`
        : `${r.dimension}: ${r.recommendation}`,
    )
    .join('；');

  const res = await fetch('/api/zhihu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stage: 'zhida',
      locale: params.locale,
      marketName: params.locale === 'zh' ? params.config.market.zh : params.config.market.name,
      productName: params.locale === 'zh' ? params.profile.nameZh ?? params.profile.name : params.profile.name,
      channels: params.config.channels,
      risksSummary: topRisks || 'Cross-border marketing localization & compliance',
    }),
    signal,
  });

  if (!res.ok) return undefined;
  const data = (await res.json()) as {
    result?: { summary: string; source: 'live' | 'fallback'; degradedReason?: string };
  };
  return data.result;
}
