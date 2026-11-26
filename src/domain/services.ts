import { mockServices } from './mock-services';
import type { ConsumerFeedback, ContentVersion, CulturalRisk, LocalizationConfig, PlatformAsset, ProductInput, ProductProfile, SellingPoint } from './types';

export interface LocalizationServices {
  analyzeProduct(input: ProductInput): Promise<ProductProfile>;
  diagnoseCulture(input: ProductInput, profile: ProductProfile, config: LocalizationConfig): Promise<CulturalRisk[]>;
  localizeSellingPoints(input: ProductInput, profile: ProductProfile, config: LocalizationConfig): Promise<SellingPoint[]>;
  generatePlatformAssets(profile: ProductProfile, points: SellingPoint[], config: LocalizationConfig): Promise<PlatformAsset[]>;
  simulateConsumers(profile: ProductProfile, version: ContentVersion, config: LocalizationConfig): AsyncIterable<ConsumerFeedback>;
  refineContent(profile: ProductProfile, version: ContentVersion, feedback: ConsumerFeedback[], config: LocalizationConfig): Promise<ContentVersion>;
}

export const hasChinese = (text: string) => /\p{Script=Han}/u.test(text);

export class LocalTranslationError extends Error {
  constructor(readonly code: 'invalid-input' | 'unavailable') {
    super(code);
  }
}

export const localizationServices: LocalizationServices = {
  ...mockServices,
  async localizeSellingPoints(input, profile, config) {
    const points = await mockServices.localizeSellingPoints(input, profile, config);
    if (profile.source !== 'text') return points;

    const chinese = points.filter(point => hasChinese(point.original));
    if (chinese.some(point => point.original.length > 240)) throw new LocalTranslationError('invalid-input');
    let translations: string[] = [];
    if (chinese.length) {
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chinese.map(point => point.original)),
        });
        if (!response.ok) throw new LocalTranslationError(response.status === 400 ? 'invalid-input' : 'unavailable');
        const result = await response.json();
        if (!Array.isArray(result.translations) || result.translations.length !== chinese.length ||
            !result.translations.every((line: unknown) => typeof line === 'string' && line.trim())) {
          throw new LocalTranslationError('unavailable');
        }
        translations = result.translations;
      } catch (error) {
        if (error instanceof LocalTranslationError) throw error;
        throw new LocalTranslationError('unavailable');
      }
    }

    let index = 0;
    return points.map(point => ({
      ...point,
      literal: hasChinese(point.original) ? translations[index++] : point.original,
    }));
  },
};
