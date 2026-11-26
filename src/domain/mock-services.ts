import { buildAssets, demoFeedback, demoInput, demoName, demoPoints, demoRisks, refinedDemoCopy, sampleFeedback } from './mock-data';
import type { LocalizationServices } from './services';
import type { CulturalRisk } from './types';

const pause = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const mockServices: LocalizationServices = {
  async analyzeProduct(input) {
    await pause(600);
    if (input.description.trim() === demoInput.description) {
      return { name: demoName, attributes: ['10,000 mAh', 'Compact', 'Portable'], source: 'demo' };
    }
    return {
      name: input.image?.name && !input.image.demo ? input.image.name.replace(/\.[^.]+$/, '') : 'Untitled product',
      attributes: input.description.trim() ? input.description.trim().split(/[。！？\n]+/).filter(Boolean).slice(0, 3) : [],
      source: input.description.trim() ? 'text' : 'image',
    };
  },
  async diagnoseCulture(input, profile, config) {
    await pause(360);
    const { market, audience, channels } = config;
    const subject = input.description.trim().slice(0, 100) || 'Image-only brief';
    const visual: CulturalRisk = {
      id: 'visual', dimension: 'Visual Adaptation', level: 'Low', original: 'Product image and campaign headline',
      explanation: `Review text legibility and product framing for ${audience.name} in ${market.name}.`,
      recommendation: `Check layouts on ${channels.join(', ') || 'the intended channels'} with the original product image. ${market.guidance}`,
    };
    if (profile.source === 'demo') return demoRisks.map(risk => risk.id === 'visual' ? visual : risk.id === 'units' ? { ...risk, recommendation: `${risk.recommendation} ${market.guidance}` } : risk);
    return [
      { id: 'language', dimension: 'Language & Tone', level: 'Low', original: subject, explanation: 'Sample review prompt. Source wording requires a human review.', recommendation: 'Explain the product benefit in plain language.' },
      { id: 'sensitivity', dimension: 'Cultural Sensitivity', level: 'Low', original: subject, explanation: 'Audience interpretation depends on the placement and wording.', recommendation: `Check idioms and references with reviewers familiar with ${market.name}.` },
      { id: 'claims', dimension: 'Marketing Claims', level: 'Medium', original: subject, explanation: 'Any measurable or comparative claims require supporting evidence.', recommendation: 'Check claims against product documentation before use.' },
      visual,
      { id: 'units', dimension: 'Units & Localization', level: 'Low', original: 'Specifications and measurements', explanation: 'Formatting requirements depend on the destination market.', recommendation: market.guidance },
    ];
  },
  async localizeSellingPoints(input, profile) {
    await pause(410);
    if (profile.source === 'demo') return demoPoints;
    const originals = input.description.trim().split(/[。！？\n；]+/).map(line => line.trim()).filter(Boolean).slice(0, 5);
    return (originals.length ? originals : ['Product image']).map((original, i) => ({
      id: `sample-${i}`, original, literal: 'Add product text to translate.',
      localized: ['See how this product fits into your day.', 'Take a closer look at the details.', 'Explore what the product can do for you.'][i % 3],
      highlight: '', reason: 'Sample framing for a custom brief. Replace with a verified benefit from your source material.',
    }));
  },
  async generatePlatformAssets(profile, points) {
    await pause(420);
    return buildAssets(profile, points);
  },
  async *simulateConsumers(profile) {
    for (const feedback of profile.source === 'demo' ? demoFeedback : sampleFeedback) {
      await pause(530);
      yield feedback;
    }
  },
  async refineContent(profile, version) {
    await pause(550);
    const sellingPoints = version.sellingPoints.map((point, i) => ({
      ...point,
      localized: profile.source === 'demo' ? refinedDemoCopy[i][0] : ['See the product in an everyday setting.', 'Review the product details before you decide.', 'Explore the verified product benefits.'][i % 3],
      highlight: profile.source === 'demo' ? refinedDemoCopy[i][1] : '',
      reason: profile.source === 'demo' ? point.reason : 'Uses a specific review action based on the simulated feedback.',
    }));
    return {
      number: 2, source: 'mock', sellingPoints, assets: buildAssets(profile, sellingPoints, true),
      changes: ['Lead with an everyday use case.', 'Guide readers to verified product details.', 'Keep claims tied to the source brief.'],
    };
  },
};
