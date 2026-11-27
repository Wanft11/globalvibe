import { buildGenericAssets, demoPresets, findDemoPreset } from './mock-data';
import type { LocalizationServices } from './services';
import type { ConsumerFeedback, CulturalRisk } from './types';

const pause = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const genericFeedback: ConsumerFeedback[] = [
  {
    persona: { id: 'g1', name: 'Maya Lin', initials: 'ML', profile: 'Gen Z Social Shopper', profileZh: '北美 Z 世代社媒活跃买家' },
    comment: 'Lead with the main everyday problem it solves in the first three seconds so I don’t scroll past.',
    commentZh: '建议前 3 秒直接展示它解决的具体日常痛点，不然刷视频很快就会划走。',
    purchaseInterest: 'Considering',
    purchaseInterestZh: '观望考虑',
    messageClarity: 'Needs sharper hook',
    messageClarityZh: '开场钩子可更具体',
    trustConcerns: 'Show real-world scale and unfiltered product footage.',
    trustConcernsZh: '希望看到无重度滤镜的实物尺寸参照与真实使用画面。',
  },
  {
    persona: { id: 'g2', name: 'Jordan Ellis', initials: 'JE', profile: 'Urban Commuter Professional', profileZh: '都市职场通勤族' },
    comment: 'Plain, verifiable specs build way more confidence than broad "best-seller" claims.',
    commentZh: '比起空泛的“爆款销冠”口号，清晰可查的客观参数和质保说明更能建立信任。',
    purchaseInterest: 'Interested',
    purchaseInterestZh: '感兴趣',
    messageClarity: 'Mostly clear',
    messageClarityZh: '核心意思清晰',
    trustConcerns: 'Include local measurement units and clear return/warranty expectations.',
    trustConcernsZh: '建议补充当地习惯的度量衡单位及清晰的售后说明。',
  },
  {
    persona: { id: 'g3', name: 'Alex Rivera', initials: 'AR', profile: 'Detail-Oriented Reddit Researcher', profileZh: '注重细节的 Reddit 评测党' },
    comment: 'On Reddit, skip any promotional urgency and share transparent limitations alongside strengths.',
    commentZh: '在社区发帖一定要去掉促销感叹号，坦诚说明适用边界反而更容易被种草。',
    purchaseInterest: 'Considering',
    purchaseInterestZh: '观望考虑',
    messageClarity: 'Clear',
    messageClarityZh: '清晰',
    trustConcerns: 'Verify technical specifications directly from product testing.',
    trustConcernsZh: '技术参数需与详情页实测数据严格一致。',
  },
];

export function splitSourcePoints(description: string): string[] {
  const sentences = description
    .trim()
    .split(/[。！？!?\n；;]+/)
    .map(line => line.trim())
    .filter(Boolean);

  // Split multi-clause sentences on Chinese commas or non-numeric English commas (preserving e.g. 20,000mAh)
  const commaPattern = /，|(?<!\d),(?!\d)/;
  const rawClauses: string[] = [];
  for (const sentence of sentences) {
    if (sentences.length < 5 && commaPattern.test(sentence)) {
      const parts = sentence.split(commaPattern).map(s => s.trim()).filter(Boolean);
      rawClauses.push(...parts);
    } else if (sentence.length > 160 && commaPattern.test(sentence)) {
      const parts = sentence.split(commaPattern).map(s => s.trim()).filter(Boolean);
      rawClauses.push(...parts);
    } else {
      rawClauses.push(sentence);
    }
  }

  // Only merge tiny 1-2 char particles so 3-4+ char Chinese selling points (e.g. "快速充电", "双口输出") stay separate
  const merged: string[] = [];
  for (const clause of rawClauses) {
    const prev = merged.at(-1);
    if (prev && (clause.length <= 2 || prev.length <= 2) && `${prev}，${clause}`.length <= 200) {
      merged[merged.length - 1] = `${prev}，${clause}`;
    } else {
      merged.push(clause.slice(0, 1200));
    }
  }

  if (merged.length <= 5) return merged;

  // Group evenly into 5 balanced points without dropping trailing numbers/specs
  const balanced: string[] = [];
  const total = merged.length;
  for (let g = 0; g < 5; g++) {
    const start = Math.floor((g * total) / 5);
    const end = Math.floor(((g + 1) * total) / 5);
    balanced.push(merged.slice(start, end).join('，').slice(0, 1200));
  }
  return balanced.filter(Boolean);
}

export const mockServices: LocalizationServices = {
  async analyzeProduct(input) {
    await pause(320);
    const preset = findDemoPreset(input);
    if (preset) return preset.profile;
    const cleanName =
      input.image?.name && !input.image.demo
        ? input.image.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
        : 'Cross-Border Product Brief';
    return {
      name: cleanName,
      nameZh: input.description.trim().slice(0, 18) || cleanName,
      attributes: input.description.trim()
        ? splitSourcePoints(input.description).slice(0, 3).map(s => s.slice(0, 26))
        : ['Visual brief'],
      source: input.description.trim() ? 'text' : 'image',
    };
  },

  async diagnoseCulture(input, profile, config) {
    await pause(260);
    const preset = profile.demoId ? demoPresets[profile.demoId] : findDemoPreset(input);
    if (preset) return preset.risks;

    const { market, audience, channels } = config;
    const subject = input.description.trim().slice(0, 96) || 'Uploaded product image';
    const risks: CulturalRisk[] = [
      {
        id: 'claims',
        dimension: 'Marketing Claims',
        level: 'Medium',
        original: subject,
        explanation: `Verify comparative rankings, timelines, or 100% guarantees before publishing in ${market.name}.`,
        explanationZh: `在面向${market.zh}市场投放前，需核查所有“第一/100%/速效”等绝对化或对比性声明是否具备合规证据。`,
        recommendation: 'Replace unsupported superlatives with concrete everyday scenarios.',
        recommendationZh: '将缺乏第三方实证的绝对化宣传词替换为具体的日常使用场景利益点。',
      },
      {
        id: 'sensitivity',
        dimension: 'Cultural Sensitivity',
        level: 'Low',
        original: subject,
        explanation: `Check appearance, body, lifestyle, and regional idioms for ${audience.name} in ${market.name}.`,
        explanationZh: `针对${market.zh}的${audience.zh}群体，排查是否存在肤色、身材焦虑、宗教习俗或刻板印象表述。`,
        recommendation: 'Use inclusive, benefit-positive framing.',
        recommendationZh: '采用包容、正向、尊重个体生活方式的沟通语态。',
      },
      {
        id: 'language',
        dimension: 'Language & Tone',
        level: 'Medium',
        original: subject,
        explanation: 'Direct translations of domestic e-commerce urgency slogans often read as low-trust spam abroad.',
        explanationZh: '国内电商常见的“黑科技/亏本冲量/闭眼入”直译为英文后容易显得生硬或触发海外用户防骗警惕。',
        recommendation: `Adapt tone natively across ${channels.join(', ')}.`,
        recommendationZh: `结合 ${channels.join(' / ')} 各平台原生社区语感重写钩子与行动号召。`,
      },
      {
        id: 'visual',
        dimension: 'Visual Adaptation',
        level: 'Low',
        original: input.image?.name || 'Product visual layout',
        explanation: `Ensure generous negative space and clean visual hierarchy for ${market.name} feeds.`,
        explanationZh: `检查商品图是否存在密集促销贴纸或高饱和特效，保持符合${market.zh}审美的留白与清晰视觉层级。`,
        recommendation: market.guidance,
        recommendationZh: market.guidanceZh,
      },
      {
        id: 'units',
        dimension: 'Units & Localization',
        level: 'Low',
        original: 'Specifications & measurements',
        explanation: `Format dimensions, weights, temperatures, and currency for ${market.name}.`,
        explanationZh: `将公制尺寸、重量、温度或容量同步补充为${market.zh}消费者直觉熟悉的单位标准。`,
        recommendation: market.guidance,
        recommendationZh: market.guidanceZh,
      },
    ];
    return risks;
  },

  async localizeSellingPoints(input, profile) {
    await pause(280);
    const preset = profile.demoId ? demoPresets[profile.demoId] : findDemoPreset(input);
    if (preset) return preset.points;

    const originals = splitSourcePoints(input.description);
    return (originals.length ? originals : ['Uploaded product visual']).map((original, i) => ({
      id: `sample-${i}`,
      original,
      literal: original,
      localized: [
        'Designed to simplify your everyday routine with dependable performance.',
        'Thoughtful details built around real-world daily use.',
        'Clean, practical design ready for home, work, or travel.',
        'Clear specifications so you know exactly how it fits your setup.',
        'Explore verified details and see how it works in practice.',
      ][i % 5],
      highlight: ['everyday routine', 'real-world daily use', 'home, work, or travel', 'Clear specifications', 'verified details'][i % 5],
      reason: 'Reframes domestic promotional wording into concrete user-centric value.',
      reasonZh: '将国内偏促销口号的表达重构为海外用户看重的具体生活场景与清晰参数价值。',
    }));
  },

  async generatePlatformAssets(profile, points) {
    await pause(280);
    if (profile.demoId && demoPresets[profile.demoId]) {
      return demoPresets[profile.demoId].assetsV1;
    }
    return buildGenericAssets(profile, points, false);
  },

  async *simulateConsumers(profile, _version, config) {
    const preset = profile.demoId && demoPresets[profile.demoId] ? demoPresets[profile.demoId] : undefined;
    if (preset) {
      for (const feedback of preset.feedback) {
        await pause(360);
        yield feedback;
      }
      return;
    }
    const mktEn = config.market.name;
    const mktZh = config.market.zh;
    const audEn = config.audience.name;
    const audZh = config.audience.zh;
    const localizedFallback: ConsumerFeedback[] = genericFeedback.map((fb, idx) =>
      idx === 0
        ? {
            ...fb,
            persona: {
              ...fb.persona,
              profile: `${mktEn} · ${audEn}`,
              profileZh: `${mktZh} · ${audZh}`,
            },
          }
        : fb,
    );
    for (const feedback of localizedFallback) {
      await pause(360);
      yield feedback;
    }
  },

  async refineContent(profile, version) {
    await pause(420);
    const preset = profile.demoId ? demoPresets[profile.demoId] : undefined;
    if (preset) {
      const sellingPoints = version.sellingPoints.map((point, i) => {
        const refined = preset.refinedPoints[i] ?? preset.refinedPoints[0];
        return {
          ...point,
          localized: refined.localized,
          highlight: refined.highlight,
          reason: refined.reason,
          reasonZh: refined.reasonZh,
        };
      });
      return {
        number: 2,
        source: 'mock',
        sellingPoints,
        assets: preset.assetsV2,
        changes: preset.changesV2,
        changesZh: preset.changesV2Zh,
      };
    }

    const sellingPoints = version.sellingPoints.map((point, i) => ({
      ...point,
      localized: [
        'Built for everyday moments — see real-world sizing and usage upfront.',
        'Clear, verifiable specs designed to earn confidence before you buy.',
        'Practical design tailored to fit effortlessly into your routine.',
      ][i % 3],
      highlight: ['real-world sizing', 'verifiable specs', 'fit effortlessly'][i % 3],
      reason: 'Tightens specificity and transparency based on focus group feedback.',
      reasonZh: '结合模拟客群反馈，补充实物尺寸参照与透明参数指引，降低决策顾虑。',
    }));
    return {
      number: 2,
      source: 'mock',
      sellingPoints,
      assets: buildGenericAssets(profile, sellingPoints, true),
      changes: [
        'Sharpened opening hook around everyday context.',
        'Added transparent spec and sizing cues to address buyer hesitation.',
      ],
      changesZh: [
        '强化开场具体日常使用场景，提升前 3 秒停留率',
        '补充透明规格与尺寸预期引导，消解海外买家信任顾虑',
      ],
    };
  },
};
