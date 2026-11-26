import type { AudienceProfile, Channel, ConsumerFeedback, CulturalRisk, MarketProfile, PlatformAsset, ProductInput, ProductProfile, SellingPoint } from './types';

export const channels: Channel[] = ['TikTok', 'Instagram', 'Reddit', 'Website', 'B2B Email'];
export const markets: MarketProfile[] = [
  { id: 'us', name: 'United States', zh: '美国', guidance: 'Use US English and keep battery capacity in mAh.' },
  { id: 'uk', name: 'United Kingdom', zh: '英国', guidance: 'Use UK spelling and confirm that any measurements match local listings.' },
  { id: 'eu', name: 'European Union', zh: '欧盟', guidance: 'Confirm the destination country and language before finalizing labels.' },
  { id: 'me', name: 'Middle East', zh: '中东', guidance: 'Confirm the destination country and language. Test right-to-left layouts if Arabic is selected.' },
];
export const audiences: AudienceProfile[] = [
  { id: 'gen-z', name: 'Gen Z', zh: 'Z 世代' },
  { id: 'professional', name: 'Young Professionals', zh: '年轻职场人士' },
  { id: 'families', name: 'Families', zh: '家庭用户' },
  { id: 'tech', name: 'Tech Enthusiasts', zh: '科技爱好者' },
  { id: 'general', name: 'General Consumers', zh: '普通消费者' },
  { id: 'custom', name: 'Custom Audience', zh: '自定义受众' },
];

export const demoName = '10000mAh Portable Power Bank';
export const demoInput: ProductInput = {
  description: '全网热销爆款，黑科技快充加持，10000mAh 超大容量，小巧便携，出门一天不用担心没电。高颜值，高性价比，闭眼入！',
  image: { src: '/demo-power-bank.webp', name: 'Demo product image', demo: true },
};

export const demoPoints: SellingPoint[] = [
  { id: 'ranking', original: '全网热销爆款', literal: 'A smash hit selling across the entire internet.', localized: 'Made for charging on the go.', highlight: 'charging on the go', reason: 'Replaces an unsupported popularity claim with a use case.' },
  { id: 'charging', original: '黑科技快充加持', literal: 'Powered by black-tech fast charging.', localized: 'Top up your phone between stops.', highlight: 'between stops', reason: 'Replaces unfamiliar jargon and avoids implying verified charging speed.' },
  { id: 'capacity', original: '10000mAh 超大容量', literal: 'An extra-large 10000mAh capacity.', localized: '10,000 mAh of portable power.', highlight: '10,000 mAh', reason: 'Keeps the stated capacity and removes the subjective size comparison.' },
  { id: 'portability', original: '小巧便携，出门一天不用担心没电', literal: 'Compact and portable, with no worry about running out of power all day.', localized: 'A compact backup for busy days away from an outlet.', highlight: 'compact backup', reason: 'Turns an absolute battery-life promise into a practical use case.' },
  { id: 'value', original: '高颜值，高性价比，闭眼入！', literal: 'Great looks, great value. Buy it with your eyes closed!', localized: 'A clean design you can carry every day.', highlight: 'carry every day', reason: 'Trades a high-pressure idiom and unverified value claim for a concrete appeal.' },
];

export const demoRisks: CulturalRisk[] = [
  { id: 'claims', dimension: 'Marketing Claims', level: 'High', original: '全网热销爆款', explanation: 'A broad popularity claim implies sales evidence that the brief does not include.', recommendation: 'Lead with portability or the stated capacity.' },
  { id: 'language', dimension: 'Language & Tone', level: 'Medium', original: '黑科技', explanation: 'A literal rendering is ambiguous in English and can distract from the charging use case.', recommendation: 'Describe a real benefit or use a verified technical term.' },
  { id: 'sensitivity', dimension: 'Cultural Sensitivity', level: 'Medium', original: '闭眼入', explanation: 'The idiom asks the reader to buy without checking details, which may undermine trust.', recommendation: 'Use an invitation to see product details.' },
  { id: 'visual', dimension: 'Visual Adaptation', level: 'Low', original: 'Product image and campaign headline', explanation: '', recommendation: '' },
  { id: 'units', dimension: 'Units & Localization', level: 'Low', original: '10000mAh', explanation: 'Capacity formatting should be consistent across the selected assets.', recommendation: 'Use 10,000 mAh and avoid converting capacity into guaranteed hours of use.' },
];

const personas = [
  { id: 'mia', name: 'Mia Chen', initials: 'MC', profile: 'Gen Z shopper' },
  { id: 'jordan', name: 'Jordan Ellis', initials: 'JE', profile: 'Busy professional' },
  { id: 'alex', name: 'Alex Rivera', initials: 'AR', profile: 'Technology enthusiast' },
];
export const demoFeedback: ConsumerFeedback[] = [
  { persona: personas[0], comment: 'I’d look twice if I saw where it fits in my bag. The shorter opener feels easier to take in.', purchaseInterest: 'Interested', messageClarity: 'Clear', trustConcerns: 'Show the actual product at a useful scale.' },
  { persona: personas[1], comment: 'The commute is what sells it for me. I’d lead with the moment I reach for it between meetings.', purchaseInterest: 'Interested', messageClarity: 'Mostly clear', trustConcerns: 'Avoid promising the same battery life for everyone.' },
  { persona: personas[2], comment: 'The capacity is useful. I’d want to check charging speed and device compatibility on the product page.', purchaseInterest: 'Considering', messageClarity: 'Clear', trustConcerns: 'Keep charging specifications tied to verified details.' },
];
export const sampleFeedback: ConsumerFeedback[] = [
  { persona: personas[0], comment: 'I’d want to understand the main benefit in the first line.', purchaseInterest: 'Considering', messageClarity: 'Needs context', trustConcerns: 'Show the original product image when available.' },
  { persona: personas[1], comment: 'A specific everyday use case would help me decide whether it’s relevant.', purchaseInterest: 'Considering', messageClarity: 'Needs context', trustConcerns: 'Support any broad performance promises.' },
  { persona: personas[2], comment: 'I’d like a clear route to verified details before buying.', purchaseInterest: 'Undecided', messageClarity: 'Mostly clear', trustConcerns: 'Verify specifications in the source listing.' },
];

export const refinedDemoCopy = [
  ['Low battery between meetings? Keep a backup close.', 'between meetings'],
  ['A quick stop between plans is a good time to top up.', 'time to top up'],
  ['10,000 mAh in a portable backup.', '10,000 mAh'],
  ['Pack a compact backup for your commute.', 'for your commute'],
  ['See the design and check the details before you buy.', 'check the details'],
];

export function buildAssets(profile: ProductProfile, points: SellingPoint[], refined = false): PlatformAsset[] {
  const isDemo = profile.source === 'demo';
  const hook = isDemo ? (refined ? 'Low battery between meetings?' : 'Out all day? Bring backup.') : (refined ? 'Where would this fit into your day?' : 'Meet your next everyday find.');
  const headline = isDemo ? (refined ? 'Backup power for the in-between.' : 'Go farther from the outlet.') : (refined ? 'See where it fits.' : 'Meet your next everyday find.');
  const benefits = isDemo ? ['10,000 mAh capacity', refined ? 'Compact enough for your commute' : 'Compact design for everyday carry'] : ['View product details', 'Explore everyday use cases'];
  const cta = refined ? 'Check product details' : 'Explore the product';
  const value = isDemo ? points[3].localized : 'Share one verified product benefit and its relevant use case.';
  const sections = (pairs: [string, string][]) => pairs.map(([label, text]) => ({ label, text }));

  return [
    { channel: 'TikTok', sections: sections([
      ['3-second Hook', hook],
      ['Video Script', isDemo ? `“${hook} Here’s a compact 10,000 mAh backup you can grab on your way out.”` : `“${hook} Here’s a closer look at the product and how it’s used.”`],
      ['Scene Direction', isDemo ? `Open on ${refined ? 'a low-battery glance before a meeting' : 'a bag being packed'}. Show the power bank beside a phone, then a real charging setup.` : 'Open with the original product in frame. Show a verified use case in natural lighting.'],
      ['CTA', cta],
    ]) },
    { channel: 'Instagram', visual: { headline, benefits, cta }, sections: sections([
      ['Caption', isDemo ? `${headline} ${value} ${cta}.` : `${headline} Take a closer look at the product and its details.`],
      ['Hashtags', isDemo ? '#EverydayCarry #PortablePower #PowerBank' : '#ProductSpotlight #EverydayFinds'],
    ]) },
    { channel: 'Reddit', sections: sections([
      ['Post Title', isDemo ? 'Brand team here: what do you look for in a portable power bank?' : 'Brand team here: what would you want to know about this product?'],
      ['Transparent Brand-authored Post', isDemo ? `I’m with the team behind this compact 10,000 mAh power bank. ${refined ? 'What charging and compatibility details would you check first?' : 'What matters most when you carry a backup charger?'}` : 'I’m with the team behind this product. We’d like to hear what details or use cases you would want to see before considering it.'],
      ['Community Tone Guidance', 'Disclose your affiliation up front. Check the subreddit rules and answer questions with verified information.'],
    ]) },
    { channel: 'Website', visual: { headline, benefits, cta }, sections: sections([
      ['Hero Headline', headline], ['Subheadline', value], ['Product Benefits', benefits.join('\n')], ['CTA', cta],
    ]) },
    { channel: 'B2B Email', sections: sections([
      ['Subject Line', isDemo ? `A compact 10,000 mAh power bank for your ${refined ? 'commuter assortment' : 'portable charging range'}` : 'Product introduction for your assortment'],
      ['Email Body', `Hi [Name],\n\nI’m reaching out to introduce ${isDemo ? 'our compact portable power bank' : 'our product'}. Would it be useful to share verified product details for your upcoming assortment review?\n\nBest,\n[Brand team]`],
      ['Value Proposition', value], ['CTA', 'Reply to request the product details.'],
    ]) },
  ];
}
