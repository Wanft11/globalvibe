import type {
  AudienceProfile,
  Channel,
  ConsumerFeedback,
  CulturalRisk,
  DemoCaseId,
  MarketProfile,
  PlatformAsset,
  ProductInput,
  ProductProfile,
  SellingPoint,
} from './types';

export const channels: Channel[] = ['TikTok', 'Instagram', 'Reddit', 'Website', 'B2B Email'];

export const markets: MarketProfile[] = [
  {
    id: 'us',
    name: 'United States',
    zh: '美国',
    guidance: 'Use US English, pair metric specs with imperial units (in, oz, lbs, °F), and avoid unsubstantiated FTC superlatives.',
    guidanceZh: '采用美式英语表达，补充英制单位（in / oz / lbs / °F），避免违反 FTC 广告法的绝对化用语。',
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    zh: '英国',
    guidance: 'Use understated UK spelling and ASA-compliant factual claims rather than aggressive hype.',
    guidanceZh: '采用英式拼写与克制语态，遵守英国 ASA 广告标准，避免浮夸促销口号。',
  },
  {
    id: 'eu',
    name: 'European Union',
    zh: '欧盟',
    guidance: 'Prioritize durability, transparent technical specs, CE compliance cues, and sustainability.',
    guidanceZh: '突出产品耐用性、透明参数与环保可持续价值，注意欧盟消费者保护与合规表述。',
  },
  {
    id: 'me',
    name: 'Middle East',
    zh: '中东',
    guidance: 'Respect local modesty, family/hospitality gifting values, and avoid alcohol or inappropriate imagery.',
    guidanceZh: '尊重当地着装端庄与宗教礼俗，契合家庭聚会与礼赠文化，严格规避酒精及敏感视觉元素。',
  },
];

export const audiences: AudienceProfile[] = [
  { id: 'gen-z', name: 'Gen Z', zh: 'Z 世代年轻群体' },
  { id: 'professional', name: 'Young Professionals', zh: '都市通勤职场人' },
  { id: 'families', name: 'Families', zh: '品质家庭用户' },
  { id: 'tech', name: 'Tech Enthusiasts', zh: '硬核科技与户外玩家' },
  { id: 'general', name: 'General Consumers', zh: '普通大众消费者' },
  { id: 'custom', name: 'Custom Audience', zh: '自定义受众' },
];

export interface DemoPreset {
  id: DemoCaseId;
  labelEn: string;
  labelZh: string;
  tagZh: string;
  tagEn: string;
  market: string;
  audience: string;
  channels: Channel[];
  input: ProductInput;
  profile: ProductProfile;
  risks: CulturalRisk[];
  points: SellingPoint[];
  refinedPoints: Array<{ localized: string; highlight: string; reason: string; reasonZh: string }>;
  assetsV1: PlatformAsset[];
  assetsV2: PlatformAsset[];
  feedback: ConsumerFeedback[];
  changesV2: string[];
  changesV2Zh: string[];
}

const sectionPairs = (pairs: [string, string][]) => pairs.map(([label, text]) => ({ label, text }));

export const demoPresets: Record<DemoCaseId, DemoPreset> = {
  powerbank: {
    id: 'powerbank',
    labelEn: '3C Tech · Airline-Safe Power Bank',
    labelZh: '3C 数码 · 便携快充充电宝',
    tagZh: 'TSA登机合规 / 去防爆惊吓词',
    tagEn: 'TSA compliance & safety tone',
    market: 'us',
    audience: 'professional',
    channels: ['TikTok', 'Instagram', 'Reddit', 'Website'],
    input: {
      description:
        '【3C销冠王】黑科技140W超级闪充移动电源！27000毫安（99.9Wh）超大容量，秒杀苹果原装充电器！采用军工级防爆锂电芯，100%绝不发热自燃，支持直接带上全球所有飞机，机身长15.2厘米仅重480克，源头工厂清仓买一送一！',
      image: { src: '/demo-power-bank.webp', name: 'demo-power-bank.webp', demo: 'powerbank' },
    },
    profile: {
      name: '99.9Wh Travel Fast-Charge Power Bank',
      nameZh: '99.9Wh 差旅快充移动电源',
      attributes: ['27,000 mAh / 99.9Wh', '140W Fast Charge', '6.0 in · 1.06 lbs'],
      source: 'demo',
      demoId: 'powerbank',
    },
    risks: [
      {
        id: 'claims',
        dimension: 'Marketing Claims',
        level: 'High',
        original: '【3C销冠王】…秒杀苹果原装充电器…100%绝不发热自燃',
        explanation: 'Unverified #1 rankings, competitor disparagement, and absolute zero-heat guarantees violate FTC rules and marketplace policies.',
        explanationZh: '“销冠王”无第三方数据支撑，“秒杀苹果原装”在欧美易触发商标侵权投诉，“100%绝不发热”违反 FTC 真实性原则。',
        recommendation: 'Focus on 140W multi-device output and temperature monitoring without naming competitors.',
        recommendationZh: '删除竞品拉踩与绝对化零发热承诺，改为强调 140W 多设备快充体验与日常温控保护。',
      },
      {
        id: 'sensitivity',
        dimension: 'Cultural Sensitivity',
        level: 'High',
        original: '军工级防爆锂电芯 + 源头工厂清仓买一送一',
        explanation: '"Explosion-proof" triggers lithium-battery recall fear among US flyers, while "factory clearance BOGO" signals cheap hazardous cells.',
        explanationZh: '“防爆（Explosion-proof）”在英语语境反而唤醒消费者对电池起火召回的恐惧；“工厂清仓买一送一”在 3C 品类会传递劣质电芯廉价感。',
        recommendation: 'Reframe around reliable travel-ready engineering and everyday peace of mind.',
        recommendationZh: '规避“爆炸/自燃/清仓”字眼，重构为可靠差旅续航与桌面极简装备感（Everyday Carry）。',
      },
      {
        id: 'language',
        dimension: 'Language & Tone',
        level: 'Medium',
        original: '支持直接带上全球所有飞机',
        explanation: 'Airline rules vary by carrier; blanket "all flights worldwide" claims risk customer confiscation complaints.',
        explanationZh: '“全球所有飞机随便带”过于绝对；北美差旅用户最认具体能量值（99.9Wh < 100Wh TSA 随身携带标准）。',
        recommendation: 'State "99.9Wh — sized under the 100Wh carry-on limit" and advise checking carrier rules.',
        recommendationZh: '精准表述为“99.9Wh 容量设计，符合主流航司 100Wh 随身登机上限”，建立专业可信度。',
      },
      {
        id: 'units',
        dimension: 'Units & Localization',
        level: 'Low',
        original: '27000毫安，机身长15.2厘米仅重480克',
        explanation: 'US shoppers evaluate dimensions in inches/pounds and prefer device-charge context alongside mAh/Wh.',
        explanationZh: '美国消费者对厘米和克缺乏直觉感知，需要英制换算（in / lbs）以及贴合通勤包收纳的尺寸描述。',
        recommendation: 'Pair 27,000 mAh (99.9Wh) with 6.0 in (15.2 cm) and 1.06 lbs (480 g).',
        recommendationZh: '同步标注 6.0 in / 1.06 lbs（480g），将枯燥毫安数转化为笔记本与手机同时补电的具体场景。',
      },
      {
        id: 'visual',
        dimension: 'Visual Adaptation',
        level: 'Low',
        original: 'Clean product render on neutral background',
        explanation: 'Clean hardware silhouette works well; showing scale next to a laptop or carry-on bag improves conversion.',
        explanationZh: '当前极简硬件主体图契合欧美科技审美，若搭配笔记本或登机箱比例参照会更具说服力。',
        recommendation: 'Pair dark editorial typography with clear Wh/wattage callouts on social cards.',
        recommendationZh: '采用深色科技感留白排版，突出 99.9Wh 登机友好与 140W 功率核心数字。',
      },
    ],
    points: [
      {
        id: 'pb-1',
        original: '【3C销冠王】黑科技140W超级闪充移动电源',
        literal: '#1 3C bestseller black-tech 140W super flash-charging power bank.',
        localized: '140W high-output portable power built for laptops and phones alike.',
        highlight: '140W high-output',
        reason: 'Drops unverified #1 claims and "black-tech" jargon in favor of clear laptop-grade wattage.',
        reasonZh: '去除无据可查的“销冠”和老外看不懂的“黑科技”，直接点明可充笔记本的 140W 高功率卖点。',
      },
      {
        id: 'pb-2',
        original: '27000毫安（99.9Wh）超大容量，支持直接带上全球所有飞机',
        literal: '27000mAh (99.9Wh) extra-large capacity, bring it directly onto all airplanes worldwide.',
        localized: '27,000 mAh (99.9Wh) capacity — engineered right under the 100Wh carry-on limit.',
        highlight: 'under the 100Wh carry-on limit',
        reason: 'Replaces risky "all flights" overclaim with exact 99.9Wh carry-on threshold travelers look for.',
        reasonZh: '将绝对化航空承诺重构为北美差旅党最看重的“卡位 100Wh 登机红线内（99.9Wh）”。',
      },
      {
        id: 'pb-3',
        original: '秒杀苹果原装充电器，笔记本手机三台同充不降速',
        literal: 'Kills original Apple chargers, charges three laptops and phones at once without slowing down.',
        localized: 'Power your laptop, phone, and earbuds together from a single compact brick.',
        highlight: 'laptop, phone, and earbuds',
        reason: 'Avoids trademark disparagement while painting a concrete multi-device travel scenario.',
        reasonZh: '规避拉踩苹果商标风险，转化为海外数字游民“单砖同时喂饱三台设备”的真实痛点场景。',
      },
      {
        id: 'pb-4',
        original: '采用军工级防爆锂电芯，100%绝不发热自燃',
        literal: 'Uses military-grade explosion-proof lithium cells, 100% never heats up or self-ignites.',
        localized: 'Dependable lithium power designed for steady, everyday multi-device charging.',
        highlight: 'steady, everyday',
        reason: 'Removes alarming "explosion/fire" wording that triggers safety anxiety in Western buyers.',
        reasonZh: '剔除“防爆/自燃”等反向引起恐慌的敏感词，改用稳健克制的日常可靠供电表述。',
      },
      {
        id: 'pb-5',
        original: '机身长15.2厘米仅重480克，源头工厂清仓买一送一',
        literal: 'Body length 15.2 cm weighing only 480 g, factory clearance buy one get one free.',
        localized: 'Compact 6.0 in (1.06 lb) profile that slips easily into your work backpack.',
        highlight: '6.0 in (1.06 lb)',
        reason: 'Converts metric specs to US imperial units and drops cheapening clearance language.',
        reasonZh: '补充美制 6.0 英寸与 1.06 磅单位换算，砍掉拉低品牌信任度的“工厂清仓”话术。',
      },
    ],
    refinedPoints: [
      {
        localized: '140W USB-C power that keeps your work laptop moving through airport layovers.',
        highlight: 'airport layovers',
        reason: 'Anchors 140W output in the concrete airport layover moment flagged by commuters.',
        reasonZh: '采纳职场通勤客群建议，把 140W 功率直接锚定在“机场转机办公不断电”的高频场景。',
      },
      {
        localized: '99.9Wh (27,000 mAh) travel-ready capacity sized under standard 100Wh carry-on rules.',
        highlight: '99.9Wh (27,000 mAh)',
        reason: 'Leads with Wh first so frequent flyers immediately verify carry-on eligibility.',
        reasonZh: '将 99.9Wh 前置展示，消除差旅人群对机场安检被扣留的头号顾虑。',
      },
      {
        localized: 'Top up your laptop, phone, and earbuds at once — check full port breakdown on the spec sheet.',
        highlight: 'full port breakdown',
        reason: 'Adds transparent spec-sheet guidance requested by tech enthusiasts.',
        reasonZh: '回应科技玩家对多口功率分配的追问，引导查看详细接口参数表，增强透明度。',
      },
      {
        localized: 'Built for consistent daily carry without bulky power bricks cluttering your bag.',
        highlight: 'without bulky power bricks',
        reason: 'Highlights bag organization and weight relief.',
        reasonZh: '从“少带笨重充电器减负”切入，比单纯讲电芯更打动日常背电脑包人群。',
      },
      {
        localized: 'Compact 6.0 in, 1.06 lb (480 g) form factor — sized like a slim travel tumbler.',
        highlight: '6.0 in, 1.06 lb',
        reason: 'Gives an intuitive everyday size comparison alongside dual imperial/metric units.',
        reasonZh: '保留英制+公制双单位，并用随行杯做体积参照，解决线上看不出实际大小的痛点。',
      },
    ],
    assetsV1: [
      {
        channel: 'TikTok',
        sections: sectionPairs([
          ['3-second Hook', 'POV: Every airport gate outlet is taken and your laptop is at 9%.'],
          ['Video Script', '“Instead of hunting for a wall plug before boarding, I keep this 99.9Wh 140W bank in my backpack. It sits right under the 100Wh carry-on limit and powers my laptop and phone at the same time.”'],
          ['Scene Direction', '[Visual] 0-2s: Crowded airport gate seat. 2-6s: Pull compact 6.0 in power bank from tech pouch, plug into laptop + phone. 6-10s: Close-up of 99.9Wh label.'],
          ['CTA', 'Check the port specs in bio before your next trip.'],
        ]),
        culturalNotes: [
          'Leads with a relatable travel pain point ("gate outlet anxiety") instead of raw specs.',
          'Soft informational CTA avoids triggering TikTok ad fatigue.',
        ],
        culturalNotesZh: [
          '用北美差旅族共鸣极强的“登机口抢不到插座”做前 3 秒视觉钩子，替代国内参数报菜名。',
          '结尾采用轻量查看参数引导，避免硬推销引发海外 Z 世代划走。',
        ],
      },
      {
        channel: 'Instagram',
        visual: {
          headline: 'Desk power that boards with you.',
          benefits: ['140W laptop-ready output', '99.9Wh carry-on friendly', '6.0 in · 1.06 lb compact build'],
          cta: 'Explore Tech Specs',
        },
        sections: sectionPairs([
          ['Caption', 'One compact brick, three devices, zero outlet hunting.\n\nSized at 99.9Wh (27,000 mAh) and 6.0 inches long, it slips into your daily carry and keeps laptops and phones moving from morning coffee to late flights.'],
          ['Hashtags', '#EverydayCarry #TechEssentials #DigitalNomadGear #RemoteWorkSetup #TravelTech'],
        ]),
        culturalNotes: [
          'Frames the charger as aesthetic "Everyday Carry (EDC)" gear valued on Instagram.',
          'Combines broad travel tags with niche EDC community hashtags.',
        ],
        culturalNotesZh: [
          '切入欧美 IG 极火的 #EverydayCarry（每日随身装备）桌搭文化，弱化促销感、强化生活质感。',
          '正文分段留白，同时清晰列出 99.9Wh 与 6.0 英寸英制尺寸。',
        ],
      },
      {
        channel: 'Reddit',
        sections: sectionPairs([
          ['Post Title', 'Brand team here — we built a 6-inch 99.9Wh (27,000mAh) 140W power bank. What port split details matter most to you?'],
          ['Transparent Brand-authored Post', 'Hey everyone, disclosing upfront that I work with the product team behind this 27,000 mAh (99.9Wh) portable power bank. It weighs 1.06 lbs (480 g) and is sized to stay just under the 100Wh carry-on threshold while delivering 140W output across laptop and phone setups. Before we finalize our spec breakdown page, what sustained-load curves or multi-port watt splits do you always check first?'],
          ['Community Tone Guidance', 'Disclose brand affiliation in the first sentence; answer technical questions honestly without promotional links unless asked.'],
        ]),
        culturalNotes: [
          'Transparent brand disclosure prevents r/UsbCHardware or r/onebag backlash.',
          'Inviting geeky spec questions earns authentic community engagement.',
        ],
        culturalNotesZh: [
          'Reddit 硬件社区（如 r/UsbCHardware）极度反感水军暗广，首句坦诚官方身份并请教功率分配曲线反而最受尊重。',
          '零感叹号、零促销词，完全使用硬核玩家熟悉的 Wh / lbs 客观参数沟通。',
        ],
      },
      {
        channel: 'Website',
        visual: {
          headline: '140W power. Carry-on ready.',
          benefits: ['99.9Wh / 27,000 mAh capacity', 'Charges laptop + phone together', 'Compact 6.0 in · 1.06 lb body'],
          cta: 'View Full Specifications',
        },
        sections: sectionPairs([
          ['Hero Headline', '140W power. Carry-on ready.'],
          ['Subheadline', 'A 99.9Wh (27,000 mAh) travel power bank built to keep laptops and phones running far from wall outlets.'],
          ['Product Benefits', '140W high-output charging for laptops and mobile gear\n99.9Wh capacity sized under standard 100Wh carry-on limits\n6.0 in (15.2 cm), 1.06 lb (480 g) silhouette for daily backpacks'],
          ['CTA', 'View Full Specifications'],
        ]),
        culturalNotes: [
          'Clean 4-word headline communicates wattage + flight eligibility in 2 seconds.',
          'Dual imperial/metric specs reduce return rates from size surprises.',
        ],
        culturalNotesZh: [
          '独立站首屏主标题控制在 4 个词内，2 秒传递“140W 大功率 + 可登机”两大核心购买决策点。',
          '同时提供英制与公制尺寸重量，大幅降低欧美消费者因体积预期偏差导致的退货率。',
        ],
      },
      {
        channel: 'B2B Email',
        sections: sectionPairs([
          ['Subject Line', 'Assortment inquiry: 99.9Wh / 140W travel power bank for commuter & travel retail'],
          ['Email Body', 'Hi [Buyer Name],\n\nI am reaching out to share our 27,000 mAh (99.9Wh) 140W portable power bank for your upcoming travel and mobile accessories review. At 6.0 in and 1.06 lbs, it is positioned for business travelers seeking laptop-capable backup power under the 100Wh carry-on limit.\n\nWould it be helpful if I sent over our full technical spec sheet and MOQ details?\n\nBest regards,\n[Name]'],
          ['Value Proposition', 'High-wattage laptop backup in a carry-on-friendly 99.9Wh footprint.'],
          ['CTA', 'Reply for spec sheet & sample availability'],
        ]),
        culturalNotes: [
          'Respectful, low-pressure Western B2B outreach focused on category fit.',
          'Replaces "get rich OEM clearance" phrasing with professional spec-sheet offer.',
        ],
        culturalNotesZh: [
          '摒弃中式“日产十万件加盟暴富”话术，以品类定位与规格书（Spec Sheet）切入欧美买手沟通礼仪。',
          '邮件简短克制，聚焦差旅零售渠道选品痛点。',
        ],
      },
    ],
    assetsV2: [
      {
        channel: 'TikTok',
        sections: sectionPairs([
          ['3-second Hook', 'Flight delayed 2 hours and zero open outlets? Here is what stays in my carry-on.'],
          ['Video Script', '“This 99.9Wh 140W power bank sits right under the 100Wh carry-on limit and weighs just over a pound — about the size of a slim travel mug. I plug my laptop and phone right in at the gate.”'],
          ['Scene Direction', '[Visual] Show size next to a 12oz coffee cup, plug laptop + phone in simultaneously, flash 99.9Wh print on casing.'],
          ['CTA', 'See full multi-port wattage chart in bio.'],
        ]),
        culturalNotes: ['Added tangible coffee-cup scale cue requested in focus group testing.'],
        culturalNotesZh: ['根据客群反馈增加了与咖啡杯同框对比画面，直观消除对 1.06 磅体积的顾虑。'],
      },
      {
        channel: 'Instagram',
        visual: {
          headline: 'Layover-proof laptop power.',
          benefits: ['99.9Wh carry-on compliant size', '140W multi-device output', 'Slim 6.0 in · 1.06 lb carry'],
          cta: 'See Port Wattage Guide',
        },
        sections: sectionPairs([
          ['Caption', 'Built for delayed flights, back-to-back client days, and café tables far from the wall.\n\n99.9Wh (27,000 mAh) · 140W output · 6.0 in (1.06 lbs).'],
          ['Hashtags', '#CarryOnOnly #OneBagTravel #EverydayCarry #LaptopAccessories #WorkFromAnywhere'],
        ]),
        culturalNotes: ['Shifted headline directly to layover reliability and transparent port wattage CTA.'],
        culturalNotesZh: ['将主标题聚焦“转机不断电”，CTA 改为透明展示多口功率分配图。'],
      },
      {
        channel: 'Reddit',
        sections: sectionPairs([
          ['Post Title', 'Brand team here: 99.9Wh (27,000mAh) 140W bank at 1.06 lbs — sharing physical dimensions & asking what load data you want on our page'],
          ['Transparent Brand-authored Post', 'Hi folks — I am with the product team. Based on early feedback from travelers, we are publishing exact dimensions (6.0 in / 15.2 cm, 1.06 lbs / 480 g) and multi-device port behavior upfront rather than vague marketing claims. What specific thermal or multi-port split numbers help you evaluate a 140W pack?'],
          ['Community Tone Guidance', 'Lead with exact measurements and invite critical technical questions.'],
        ]),
        culturalNotes: ['Explicitly foregrounds physical weight and multi-port transparency.'],
        culturalNotesZh: ['直接前置物理尺寸与多口分配说明，精准契合极客受众的信任点。'],
      },
      {
        channel: 'Website',
        visual: {
          headline: 'Layover-proof 140W power.',
          benefits: ['99.9Wh — under 100Wh carry-on limit', 'Laptop + phone simultaneous top-up', '6.0 in · 1.06 lb backpack-friendly size'],
          cta: 'See Port & Spec Breakdown',
        },
        sections: sectionPairs([
          ['Hero Headline', 'Layover-proof 140W power.'],
          ['Subheadline', '99.9Wh (27,000 mAh) portable power in a 6.0 in, 1.06 lb frame — sized for carry-on bags and busy workdays.'],
          ['Product Benefits', '99.9Wh rating engineered under standard 100Wh carry-on limits\n140W high-output charging for laptops, tablets, and phones\n6.0 in (15.2 cm), 1.06 lb (480 g) profile — slim enough for tech pouches'],
          ['CTA', 'See Port & Spec Breakdown'],
        ]),
        culturalNotes: ['Leads with 99.9Wh compliance and clear spec-sheet access.'],
        culturalNotesZh: ['首条利益点直击 99.9Wh 登机合规，CTA 引导查看完整参数拆解。'],
      },
      {
        channel: 'B2B Email',
        sections: sectionPairs([
          ['Subject Line', 'Spec sheet: 99.9Wh / 140W carry-on laptop power bank (6.0 in, 1.06 lbs)'],
          ['Email Body', 'Hi [Buyer Name],\n\nSharing quick specs on our 99.9Wh (27,000 mAh) 140W power bank tailored for business travel retail. Happy to send the full port-allocation sheet and compliance documentation if relevant to your Q3 line review.\n\nBest,\n[Name]'],
          ['Value Proposition', 'Transparent 99.9Wh carry-on positioning with 140W laptop support.'],
          ['CTA', 'Request spec & compliance pack'],
        ]),
        culturalNotes: ['Added compliance pack mention that retail buyers require for lithium goods.'],
        culturalNotesZh: ['补充锂电池零售采购必看的合规文档（Compliance Pack）说明，提升专业回复率。'],
      },
    ],
    feedback: [
      {
        persona: { id: 'p1', name: 'Hannah Brooks', initials: 'HB', profile: 'NYC Consulting Analyst · Frequent Flyer', profileZh: '纽约咨询顾问 · 高频差旅族' },
        comment: 'Putting 99.9Wh right in the copy actually makes me stop scrolling — TSA rules always stress me out. Just show me how big 1.06 lbs looks next to a coffee cup.',
        commentZh: '直接标出 99.9Wh 真的会让我停下来看，每次过 TSA 安检都很怕充电宝被扣。不过最好拿咖啡杯对比一下 1.06 磅实际有多大。',
        purchaseInterest: 'High interest',
        purchaseInterestZh: '很有购买意向',
        messageClarity: 'Clear value hook',
        messageClarityZh: '核心利益清晰',
        trustConcerns: 'Wants visual size reference in a real carry-on bag.',
        trustConcernsZh: '希望有直观的随身包/咖啡杯体积参照，怕实物太笨重。',
      },
      {
        persona: { id: 'p2', name: 'Devon Patel', initials: 'DP', profile: 'SF Software Engineer · r/UsbCHardware Regular', profileZh: '旧金山程序员 · Reddit 充电硬件发烧友' },
        comment: 'Glad it skips the fake "military explosion-proof" nonsense. Before buying a 140W bank, I immediately look for the multi-port watt split table when two devices are plugged in.',
        commentZh: '很庆幸文案没有吹什么“军工防爆”那种一眼假的词。买 140W 充电宝前，我第一件事就是看双口同时插时的功率分配表。',
        purchaseInterest: 'Considering',
        purchaseInterestZh: '观望考虑（看参数细节）',
        messageClarity: 'Good, needs port detail',
        messageClarityZh: '表述克制，需补接口分配说明',
        trustConcerns: 'Wants transparent multi-port wattage breakdown on product page.',
        trustConcernsZh: '需要透明公开多设备同充时的功率分配明细。',
      },
      {
        persona: { id: 'p3', name: 'Claire Miller', initials: 'CM', profile: 'Austin Hybrid Creative Director', profileZh: '奥斯汀混合办公创意总监' },
        comment: 'The "desk power that boards with you" line clicks right away for café and airport days.',
        commentZh: '“能跟着你登机的桌面电源”这句话一下子戳中了常在咖啡馆和机场办公的人。',
        purchaseInterest: 'High interest',
        purchaseInterestZh: '很有购买意向',
        messageClarity: 'Very clear',
        messageClarityZh: '非常清晰地道',
        trustConcerns: 'Confirm which cables or ports are needed for full 140W speed.',
        trustConcernsZh: '想确认跑满 140W 需要搭配什么线材或接口。',
      },
    ],
    changesV2: [
      'Moved 99.9Wh carry-on eligibility to the top of key assets.',
      'Added slim travel-tumbler scale comparison for 6.0 in / 1.06 lbs.',
      'Updated CTAs to direct technical buyers to port wattage breakdowns.',
    ],
    changesV2Zh: [
      '将 99.9Wh 符合登机上限前置到核心卖点首位，打消差旅安检顾虑',
      '加入“随行保温杯大小”日常参照，具象化 6.0 英寸 / 1.06 磅体积感',
      '优化 CTA 引导查看多口功率分配表，满足硬核数码用户信任需求',
    ],
  },

  beauty: {
    id: 'beauty',
    labelEn: 'Skincare · RF & Red-Light Facial Wand',
    labelZh: '美妆护肤 · RF 射频光疗美容仪',
    tagZh: '禁用 Whitening / 红金大字报脱敏',
    tagEn: 'DEI glow framing & FTC beauty rules',
    market: 'us',
    audience: 'gen-z',
    channels: ['Instagram', 'TikTok', 'Website'],
    input: {
      description:
        '【双11全网销量TOP1】院线级RF射频黑科技美白嫩肤仪！7天急速美白淡斑、去黄气、逆转肌龄10岁！高能红光直达肌底，100%击退黑色素，告别暗沉黄脸婆！今日厂家亏本冲量疯抢，买一送五，机身长16.5厘米，仅重135克。',
      image: {
        src: '/demo-beauty-poster.jpg',
        cleanSrc: '/demo-beauty-clean.jpg',
        name: 'demo-beauty-poster.jpg',
        demo: 'beauty',
      },
    },
    profile: {
      name: 'RF & Red-Light Radiance Facial Wand',
      nameZh: 'RF 射频红光焕亮美容仪',
      attributes: ['RF + Red Light Ritual', 'Featherlight 4.8 oz', '6.5 in Travel Wand'],
      source: 'demo',
      demoId: 'beauty',
    },
    risks: [
      {
        id: 'sensitivity',
        dimension: 'Cultural Sensitivity',
        level: 'High',
        original: '急速美白淡斑…告别暗沉黄脸婆',
        explanation: 'Translating "美白" as "Whitening/Bleaching" triggers severe colorism backlash in Western beauty markets; "黄脸婆" is derogatory gender shaming.',
        explanationZh: '将“美白”直译为 Whitening/Bleaching 在欧美美妆圈严重触碰肤色政治敏感红线；“黄脸婆”属于性别与容貌羞辱词汇，极易引发舆论抵制。',
        recommendation: 'Reframe entirely around "Radiant Glow", "Even-Toned Luminosity", and relaxing evening self-care.',
        recommendationZh: '彻底禁用 Whitening，重构为追求健康通透光泽感（Radiant Glow / Luminosity）与悦己居家护理仪式。',
      },
      {
        id: 'claims',
        dimension: 'Marketing Claims',
        level: 'High',
        original: '7天逆转肌龄10岁！100%击退黑色素！【全网销量TOP1】',
        explanation: 'Guaranteed physiological pigment removal and "reverse skin age 10 years in 7 days" cross into unapproved FDA medical device / FTC deceptive claims.',
        explanationZh: '“7天逆龄10岁”、“100%击退黑色素”在北美涉嫌未经 FDA 批准的医疗器械疗效宣称及 FTC 虚假广告，会导致广告账户直接封禁。',
        recommendation: 'Use cosmetic appearance phrasing ("helps skin look refreshed and luminous") without guaranteed timelines.',
        recommendationZh: '改为化妆品/日常美容仪合规外观表述（如“帮助肌肤呈现饱满焕亮状态”），删除绝对化天数与百分比。',
      },
      {
        id: 'visual',
        dimension: 'Visual Adaptation',
        level: 'High',
        original: '双11红金背景 + 雷电激光特效 + 1+5疯抢爆炸贴',
        explanation: 'Saturated Double-11 red/gold badges and lightning lasers signal spammy dropshipping ads rather than trustworthy skincare.',
        explanationZh: '原图高饱和红金双11促销字、闪电红光特效及“疯抢/1+5”爆炸贴，在欧美独立站审美中会被视为劣质欺诈广告，严重伤害肌肤接触类产品的安全信任感。',
        recommendation: 'Switch to warm travertine/neutral studio photography with generous negative space (previewed in clean mode).',
        recommendationZh: '建议替换为暖调洞石/自然晨光留白产品实拍图（中栏卡片已自动启用净版 DTC 场景底图并可对比原图）。',
      },
      {
        id: 'language',
        dimension: 'Language & Tone',
        level: 'Medium',
        original: '厂家亏本冲量疯抢，买一送五',
        explanation: 'Panic-discount language erodes perceived safety and prestige for a facial device used on skin.',
        explanationZh: '上脸使用的射频仪器最忌讳“亏本甩卖”廉价口吻，欧美消费者会对超低价买一送五的电子护肤仪产生强烈安全怀疑。',
        recommendation: 'Position any included extras calmly as a "Starter Skincare Ritual Set".',
        recommendationZh: '去掉恐慌式促销口号，以温和克制的居家五分钟 SPA 体验建立高端品牌心智。',
      },
      {
        id: 'units',
        dimension: 'Units & Localization',
        level: 'Low',
        original: '机身长16.5厘米，仅重135克',
        explanation: 'Convert metric dimensions to US inches and ounces so travelers grasp how light the wand feels in hand.',
        explanationZh: '北美用户更熟悉英寸（in）和盎司（oz），换算后更能凸显手柄比手机还轻盈的握持感。',
        recommendation: 'State 6.5 in (16.5 cm) and 4.8 oz (135 g) — lighter than most smartphones.',
        recommendationZh: '标注 6.5 in（16.5 cm）与 4.8 oz（135 g），直观传达手腕久握不累与差旅便携优势。',
      },
    ],
    points: [
      {
        id: 'bw-1',
        original: '院线级RF射频黑科技美白嫩肤仪',
        literal: 'Clinic-grade RF black-tech skin-whitening rejuvenation wand.',
        localized: 'At-home RF & red-light facial wand for visibly radiant, luminous-looking skin.',
        highlight: 'radiant, luminous-looking',
        reason: 'Replaces taboo "skin-whitening" and "clinic-grade" medical claims with aspirational radiance.',
        reasonZh: '规避欧美大忌“Whitening”及院线医疗夸大词，重构为健康焕亮光泽感（Radiant & Luminous）。',
      },
      {
        id: 'bw-2',
        original: '7天急速美白淡斑、逆转肌龄10岁',
        literal: '7-day rapid whitening spot removal, reverse skin age by 10 years!',
        localized: 'Designed to support a fresher, more even-looking complexion as part of your weekly routine.',
        highlight: 'weekly routine',
        reason: 'Swaps illegal 7-day anti-aging guarantees for realistic, FTC-safe skincare routine language.',
        reasonZh: '删除违反 FTC/FDA 的“7天逆龄10岁”疗效保证，转化为可持续的日常护肤习惯表达。',
      },
      {
        id: 'bw-3',
        original: '高能红光直达肌底，告别暗沉黄脸婆',
        literal: 'High-energy red light hits skin base, say goodbye to dull yellow-faced woman!',
        localized: 'Warm RF comfort meets soothing red light to revive tired, dull-looking skin after long days.',
        highlight: 'revive tired, dull-looking skin',
        reason: 'Eliminates derogatory gender stereotype and focuses on soothing sensory self-care.',
        reasonZh: '彻底剔除“黄脸婆”容貌羞辱话术，聚焦忙碌一天后舒缓温热的感官治愈体验。',
      },
      {
        id: 'bw-4',
        original: '厂家亏本冲量疯抢，全网最低价买一送五',
        literal: 'Factory losing-money crazy rush, lowest price online buy 1 get 5 free.',
        localized: 'Turn five quiet minutes at your vanity into an effortless evening glow ritual.',
        highlight: 'evening glow ritual',
        reason: 'Replaces cheap clearance panic with calm DTC ritual positioning.',
        reasonZh: '将廉价大甩卖口吻升级为欧美独立站高溢价的“晚间 5 分钟悦己发光仪式”。',
      },
      {
        id: 'bw-5',
        original: '机身长16.5厘米，仅重135克',
        literal: 'Body length 16.5 cm, weighs only 135 grams.',
        localized: 'Featherlight 4.8 oz (135 g), 6.5 in wand — lighter than your phone and easy to pack.',
        highlight: '4.8 oz (135 g)',
        reason: 'Adds imperial units and a relatable smartphone weight comparison.',
        reasonZh: '补充 4.8 oz / 6.5 in 美制单位，并用“比手机更轻”建立清晰的握持轻盈感。',
      },
    ],
    refinedPoints: [
      {
        localized: 'Gentle RF warmth + red light in one sleek wand — pair with your favorite water-based serum.',
        highlight: 'water-based serum',
        reason: 'Answers Gen-Z skincare users asking exactly how to glide the wand safely on skin.',
        reasonZh: '回应美妆受众最关心的实操问题：明确提示搭配日常水基精华导入顺滑不拉扯皮肤。',
      },
      {
        localized: 'Supports a refreshed, glass-skin glow when used consistently 3–4 evenings a week.',
        highlight: '3–4 evenings a week',
        reason: 'Provides clear routine cadence without promising unrealistic instant transformations.',
        reasonZh: '给出“每周 3-4 晚”的清晰使用频率预期，用真诚克制赢得成分党信任。',
      },
      {
        localized: 'Unwind tired screen-day skin with soothing warmth — zero harsh downtime.',
        highlight: 'soothing warmth',
        reason: 'Connects with young users experiencing late-night screen fatigue.',
        reasonZh: '切中年轻群体熬夜刷屏后的倦容痛点，强调温和舒缓无负担。',
      },
      {
        localized: 'Minimalist vanity-ready design without cluttered attachments or complicated modes.',
        highlight: 'Minimalist vanity-ready',
        reason: 'Addresses clutter fatigue and highlights effortless usability.',
        reasonZh: '强调极简高颜值无需繁琐配件，放在洗漱台好看才会坚持用。',
      },
      {
        localized: 'Just 4.8 oz (135 g) and 6.5 in long — cordless comfort that never tires your wrist.',
        highlight: 'never tires your wrist',
        reason: 'Turns weight spec into ergonomic comfort benefit.',
        reasonZh: '将 4.8 盎司重量进一步转化为“护理全脸不酸手腕”的人体工学体验。',
      },
    ],
    assetsV1: [
      {
        channel: 'Instagram',
        visual: {
          headline: 'Your five-minute evening glow ritual.',
          benefits: ['Warm RF + soothing red light', 'Featherlight 4.8 oz wand', 'Built for effortless night routines'],
          cta: 'Discover the Ritual',
        },
        sections: sectionPairs([
          ['Caption', 'Skip the 10-step overwhelm. Five quiet minutes after cleansing — warm RF comfort, gentle red light, and your favorite hydrating serum.\n\nAt just 4.8 oz (6.5 in), it lives right on your countertop and travels wherever your weekend goes.'],
          ['Hashtags', '#EveningSkincare #GlowRitual #SkincareTools #ShelfieReady #RadiantSkin'],
        ]),
        culturalNotes: [
          'Uses "Glow Ritual" and "#ShelfieReady" aesthetics instead of aggressive before/after promises.',
          'Warm travertine visual theme matches Sephora/Glossier clean beauty expectations.',
        ],
        culturalNotesZh: [
          '采用欧美高赞的 #GlowRitual（发光仪式）与极简洗漱台美学（#ShelfieReady），彻底洗去双11叫卖感。',
          '推荐使用“暖石米白（Travertine）”海报主题色，贴合北美 Clean Beauty 审美偏好。',
        ],
      },
      {
        channel: 'TikTok',
        sections: sectionPairs([
          ['3-second Hook', 'If expensive beauty tools always end up collecting dust in your drawer, hear me out.'],
          ['Video Script', '“Most devices feel like a chore because they are heavy and complicated. This RF and red-light wand weighs 4.8 ounces — literally lighter than my phone. I put on hydrating serum, glide for five minutes while watching a show, and my skin looks so fresh andawake.”'],
          ['Scene Direction', '[Visual] Warm bathroom lighting, apply clear serum drop on cheek, smooth upward glide with rose-gold wand, close-up of natural dewy finish (no heavy beauty filter).'],
          ['CTA', 'Tap to see how it fits into a 2-step night routine.'],
        ]),
        culturalNotes: [
          'Addresses the real TikTok truth ("tools collecting dust") to build instant creator credibility.',
          'Explicitly warns against heavy beauty filters, which Western Gen-Z calls out in comments.',
        ],
        culturalNotesZh: [
          '前 3 秒用“买的美容仪总是在抽屉吃灰”反向切入，瞬间拉近真实闺蜜分享感（UGC）。',
          '分镜特别提示“勿开重度磨皮滤镜”，因为欧美 TikTok 评论区极度排斥虚假滤镜带货。',
        ],
      },
      {
        channel: 'Website',
        visual: {
          headline: 'Radiant skin, minus the guesswork.',
          benefits: ['Dual RF warmth & red light', 'Ultra-light 4.8 oz · 6.5 in body', 'Calm 5-minute evening routine'],
          cta: 'Shop the Facial Wand',
        },
        sections: sectionPairs([
          ['Hero Headline', 'Radiant skin, minus the guesswork.'],
          ['Subheadline', 'An ultra-light 4.8 oz RF and red-light wand crafted to bring a soothing, luminous finish to your nightly routine.'],
          ['Product Benefits', 'Combines gentle RF warmth with red light for refreshed, radiant-looking skin\nFeatherlight 4.8 oz (135 g), 6.5 in silhouette designed for effortless glide\nSimple controls made for consistent weekly self-care'],
          ['CTA', 'Shop the Facial Wand'],
        ]),
        culturalNotes: [
          'Replaces "Whitening" entirely with "Radiant / Luminous" across every touchpoint.',
          'Focuses on ease and consistency rather than miracle cure timelines.',
        ],
        culturalNotesZh: [
          '全站统一以 Radiant / Luminous 替代敏感词 Whitening，兼顾多元肤色包容度与高级感。',
          '强调操作简单易坚持，契合北美独立站理性护肤人群心理。',
        ],
      },
      {
        channel: 'Reddit',
        sections: sectionPairs([
          ['Post Title', 'Brand team here: designing a lightweight (4.8 oz) RF + red-light wand — what usability details keep you consistent?'],
          ['Transparent Brand-authored Post', 'Hi skincare folks — disclosing upfront that I am on the team behind this handheld RF and red-light facial wand (6.5 in, 4.8 oz / 135 g). We kept the form factor minimal so it doesn’t sit unused in a drawer. When you evaluate home LED/RF tools, what wavelength specs, heat-level controls, or serum pairings do you want clearly listed first?'],
          ['Community Tone Guidance', 'Never make medical anti-aging or pigment-erasing claims on r/SkincareAddiction; stick to hardware ergonomics and transparent specs.'],
        ]),
        culturalNotes: ['Avoids all clinical cure claims that trigger instant moderation removal on skincare subreddits.'],
        culturalNotesZh: ['严格遵守海外护肤论坛版规，绝不出现祛斑逆龄疗效词，从握持手感与波长透明度切入交流。'],
      },
      {
        channel: 'B2B Email',
        sections: sectionPairs([
          ['Subject Line', 'Clean beauty tools assortment: 4.8 oz RF & Red-Light Facial Wand'],
          ['Email Body', 'Hi [Buyer Name],\n\nReaching out to introduce our minimalist RF & Red-Light Facial Wand (6.5 in, 4.8 oz) for your beauty tools category. Designed in warm neutral finishes for countertop appeal, it offers an approachable nightly glow ritual without bulky attachments.\n\nHappy to share full technical documentation and retail packaging specs.\n\nWarm regards,\n[Name]'],
          ['Value Proposition', 'Giftable, lightweight facial tool positioned for modern self-care retail.'],
          ['CTA', 'Request lookbook & retail specs'],
        ]),
        culturalNotes: ['Uses "lookbook & retail packaging" language expected by Western boutique & beauty buyers.'],
        culturalNotesZh: ['采用美妆买手熟悉的 Lookbook 与陈列颜值切入，替代低价批发话术。'],
      },
    ],
    assetsV2: [
      {
        channel: 'Instagram',
        visual: {
          headline: 'Glide, glow, unwind in 5 minutes.',
          benefits: ['Pairs with any water-based serum', '3–4 evenings a week routine', 'Featherlight 4.8 oz ergonomic wand'],
          cta: 'See How It Works',
        },
        sections: sectionPairs([
          ['Caption', 'Your hydrating serum + five soothing minutes of RF warmth and red light, 3–4 nights a week.\n\nNo proprietary gels required, no heavy wrist fatigue — just a 4.8 oz wand that earns its spot on your sink.'],
          ['Hashtags', '#GlowRitual #SkincareRoutine #RedLightTherapy #GlassSkinGoals #CleanBeautyTools'],
        ]),
        culturalNotes: ['Explicitly highlights "no proprietary expensive gel required" — a major Western buyer win!'],
        culturalNotesZh: ['根据受众反馈点明“兼容日常水基精华，无需捆绑购买高价专用凝胶”，直击北美消费者痛点！'],
      },
      {
        channel: 'TikTok',
        sections: sectionPairs([
          ['3-second Hook', 'You don’t need an overpriced proprietary gel to actually enjoy a red-light wand.'],
          ['Video Script', '“That was my biggest hesitation too. With this 4.8 oz RF + red-light wand, I just layer my normal hyaluronic serum and glide for five minutes, 3 nights a week. Zero wrist ache, super calming warmth.”'],
          ['Scene Direction', '[Visual] Show ordinary hydrating serum bottle + wand on travertine tray, smooth cheek/jawline glide in natural light.'],
          ['CTA', 'Check the routine guide & heat settings in bio.'],
        ]),
        culturalNotes: ['Directly tackles the hidden subscription-gel objection raised by Gen-Z testers.'],
        culturalNotesZh: ['前 3 秒直接打消“后续专用凝胶刺客”顾虑，转化率大幅提升。'],
      },
      {
        channel: 'Website',
        visual: {
          headline: 'Soothing glow. Zero proprietary gels.',
          benefits: ['Works with water-based serums', 'Gentle RF + red light · 3–4x/week', 'Ultra-light 4.8 oz (135 g) wand'],
          cta: 'Explore the 5-Min Routine',
        },
        sections: sectionPairs([
          ['Hero Headline', 'Soothing glow. Zero proprietary gels.'],
          ['Subheadline', 'Pair this featherlight 4.8 oz RF & red-light wand with your favorite hydrating serum, 3–4 evenings a week.'],
          ['Product Benefits', 'Glides smoothly with everyday water-based serums — no costly refill gels\nGentle RF warmth + red light for visibly refreshed, luminous skin\n4.8 oz (135 g), 6.5 in cordless wand built for wrist-friendly comfort'],
          ['CTA', 'Explore the 5-Min Routine'],
        ]),
        culturalNotes: ['Clear routine frequency and serum compatibility eliminate pre-purchase hesitation.'],
        culturalNotesZh: ['明确使用频次与精华兼容性，消除独立站下单前的最后一重犹豫。'],
      },
      {
        channel: 'Reddit',
        sections: sectionPairs([
          ['Post Title', 'Brand team here: 4.8 oz RF + red-light wand that works with standard water-based serums — happy to answer spec questions'],
          ['Transparent Brand-authored Post', 'Hey everyone — I am with the product team. One frustration we kept hearing was tools locking users into pricey proprietary conductive gels, so we designed our 4.8 oz wand around everyday water-based hydrating serums and simple 5-minute sessions (3–4x/week). Ask us anything about build or temperature levels.'],
          ['Community Tone Guidance', 'Keep answers factual and transparent about routine expectations.'],
        ]),
        culturalNotes: ['Positions brand on the consumer’s side against predatory refill models.'],
        culturalNotesZh: ['站在消费者立场解决耗材捆绑痛点，极易赢得社区好感。'],
      },
      {
        channel: 'B2B Email',
        sections: sectionPairs([
          ['Subject Line', 'Beauty tools review: 4.8 oz RF & Red-Light Wand (compatible with standard serums)'],
          ['Email Body', 'Hi [Buyer Name],\n\nSharing our updated product brief for our 4.8 oz RF & Red-Light Facial Wand — great cross-merchandising fit alongside your existing hydrating serums.\n\nBest,\n[Name]'],
          ['Value Proposition', 'Drives natural basket pairing with existing hydrating serums.'],
          ['CTA', 'Request sample & retail deck'],
        ]),
        culturalNotes: ['Highlights cross-selling value with retailers’ existing serum SKUs.'],
        culturalNotesZh: ['向零售买手强调可带动店内现有保湿精华连带销售（Cross-sell），极具商业说服力。'],
      },
    ],
    feedback: [
      {
        persona: { id: 'b1', name: 'Chloe Nguyen', initials: 'CN', profile: 'UCLA Senior · Skincare TikTok Creator', profileZh: '加州大学生 · TikTok 护肤种草博主' },
        comment: 'Thank goodness it says "radiant glow" instead of "whitening" — whitening ads get roasted instantly on my FYP. Do I need to buy a special gel or can I use my normal serum?',
        commentZh: '太好了，用的是 Radiant Glow 而不是 Whitening——在我首页刷到美白词肯定会被狂喷。不过这支笔必须配专用凝胶吗，还是用我平时的保湿精华就行？',
        purchaseInterest: 'High interest',
        purchaseInterestZh: '很有购买意向',
        messageClarity: 'Clear aesthetic, needs serum tip',
        messageClarityZh: '审美在线，需补充精华搭配说明',
        trustConcerns: 'Worried about hidden recurring cost of proprietary conductive gels.',
        trustConcernsZh: '担心买完机器还要被迫复购昂贵的品牌专用导入凝胶。',
      },
      {
        persona: { id: 'b2', name: ' Elena Rostova', initials: 'ER', profile: 'Chicago UX Designer · Clean Beauty Shopper', profileZh: '芝加哥设计师 · 极简护肤消费者' },
        comment: 'The stone countertop photo looks legit, whereas that flashy red "1+5 FREE" poster looked like a total scam. Tell me how many nights a week I actually need to use it.',
        commentZh: '换掉那张像电信诈骗一样的红金“买1送5”海报太明智了，石材桌面实拍顺眼多了！建议写清楚一周用几次合适。',
        purchaseInterest: 'Interested',
        purchaseInterestZh: '感兴趣',
        messageClarity: 'Clean & calm',
        messageClarityZh: '克制有质感',
        trustConcerns: 'Wants realistic weekly usage cadence instead of vague promises.',
        trustConcernsZh: '希望看到真实客观的每周建议使用频次。',
      },
      {
        persona: { id: 'b3', name: 'Tasha Grant', initials: 'TG', profile: 'Atlanta Marketing Lead · Busy Mom', profileZh: '亚特兰大市场主管 · 职场宝妈' },
        comment: '4.8 oz being lighter than my phone is a great detail because heavy wands tire my hand fast.',
        commentZh: '“4.8 盎司比手机还轻”这个细节很戳我，以前买的美容仪太沉了举两分钟手就酸。',
        purchaseInterest: 'High interest',
        purchaseInterestZh: '很有购买意向',
        messageClarity: 'Very clear',
        messageClarityZh: '直观好懂',
        trustConcerns: 'Wants reassurance that warmth feels gentle on sensitive evening skin.',
        trustConcernsZh: '想确认温热感足够柔和、不会拉扯刺激皮肤。',
      },
    ],
    changesV2: [
      'Clarified compatibility with everyday water-based serums (no proprietary refill gel needed).',
      'Added realistic 3–4 evenings/week cadence requested by skincare shoppers.',
      'Reinforced wrist-friendly 4.8 oz ergonomics across TikTok and Website copy.',
    ],
    changesV2Zh: [
      '明确补充“直接搭配日常水基保湿精华即可，无需购买高价专用凝胶”，消除隐形消费顾虑',
      '加入“每周 3-4 晚、每次 5 分钟”的客观使用频次指引',
      '强化 4.8 oz 久握不酸手腕的人体工学卖点与暖石极简视觉呈现',
    ],
  },

  coffee: {
    id: 'coffee',
    labelEn: 'Outdoor Lifestyle · Portable Espresso Maker',
    labelZh: '户外数码 · 便携电动意式咖啡机',
    tagZh: '工业参数转露营场景 / Reddit反硬广',
    tagEn: 'Spec-to-lifestyle & anti-shill Reddit',
    market: 'us',
    audience: 'tech',
    channels: ['Reddit', 'Instagram', 'TikTok', 'Website'],
    input: {
      description:
        '【行业NO.1户外神器】军工级航空铝合金机身，搭载黑科技20Bar超强恒温增压泵，3秒极速出油脂！内置30000mAh超大容量防爆锂电池，92℃精准控温，水箱容量80毫升，整机重量仅620克！源头工厂直供性价比无敌，户外露营必备！',
      image: {
        src: '/demo-coffee-poster.jpg',
        cleanSrc: '/demo-coffee-clean.jpg',
        name: 'demo-coffee-poster.jpg',
        demo: 'coffee',
      },
    },
    profile: {
      name: '20-Bar Cordless Trail Espresso Maker',
      nameZh: '20-Bar 户外无线便携意式咖啡机',
      attributes: ['20-Bar Pump · 198°F (92°C)', '2.7 fl. oz. Tank', '1.37 lbs · 30,000 mAh'],
      source: 'demo',
      demoId: 'coffee',
    },
    risks: [
      {
        id: 'claims',
        dimension: 'Marketing Claims',
        level: 'High',
        original: '【行业NO.1户外神器】…3秒极速出油脂…防爆锂电池',
        explanation: 'Unverified #1 claims and "espresso crema in 3 seconds" (cold water heating takes minutes) will get torn apart by Western coffee enthusiasts.',
        explanationZh: '“行业 NO.1”违规且无据；“3秒极速出液”极易被欧美咖啡老饕质疑加热物理常识而差评翻车（应区分热水直萃与冷水加热时长）。',
        recommendation: 'Separate pump pressure (20-bar) and 198°F (92°C) brew temp from exaggerated 3-second heating claims.',
        recommendationZh: '如实陈述 20-Bar 萃取压力与 198°F（92°C）控温，删除违背常识的“3秒极速”和引起恐慌的“防爆”字眼。',
      },
      {
        id: 'visual',
        dimension: 'Visual Adaptation',
        level: 'Medium',
        original: '赛博蓝光网格 + 火焰爆炸特效 + NO.1 金属徽章海报',
        explanation: 'Sci-fi laser grids and fire explosions clash badly with North American outdoor/overlanding coffee culture.',
        explanationZh: '原图黑底赛博蓝光网格与火焰爆炸特效充满“五金数码大卖场”气息，与北美露营/公路旅行（Overlanding）追求的自然晨雾松林美学格格不入。',
        recommendation: 'Use golden-hour trailside pour photography showing real crema and natural wood textures.',
        recommendationZh: '切换为高山晨雾木桌实拍出液画面（中栏卡片已自动启用净版户外场景图并推荐森系黑曜主题色）。',
      },
      {
        id: 'language',
        dimension: 'Language & Tone',
        level: 'Medium',
        original: '军工级航空铝合金…源头工厂直供性价比无敌',
        explanation: '"Military-grade" and "factory-direct unbeatable value" read like generic dropshipping copy on r/espresso and r/camping.',
        explanationZh: '“军工级”在欧美早已被滥用成廉价通货代名词，“工厂直供性价比无敌”在 Reddit 咖啡与露营社区会被直接判定为垃圾硬广。',
        recommendation: 'Use tactile gear language: anodized aluminum body, trail-ready durability, rich crema away from camp stoves.',
        recommendationZh: '改用北美户外装备党语言（阳极氧化铝机身、免炉头无线萃取、营地清晨第一杯油脂浓缩）。',
      },
      {
        id: 'units',
        dimension: 'Units & Localization',
        level: 'Medium',
        original: '92℃精准控温，水箱容量80毫升，整机重量仅620克',
        explanation: 'US campers & baristas think in Fahrenheit (°F), fluid ounces (fl. oz.), and pounds (lbs).',
        explanationZh: '美国用户看水温认华氏度（°F）、看水量认液量盎司（fl. oz.）、看背包负重认磅（lbs）。',
        recommendation: 'Convert to 198°F (92°C), 2.7 fl. oz. (80 ml — double-shot size), and 1.37 lbs (620 g).',
        recommendationZh: '精准换算为 198°F（92°C 黄金萃取温区）、2.7 fl. oz.（80ml 双份浓缩水量）和 1.37 lbs（620g）。',
      },
      {
        id: 'sensitivity',
        dimension: 'Cultural Sensitivity',
        level: 'Low',
        original: '户外露营必备神器',
        explanation: 'Outdoor communities value Leave No Trace mindfulness and honest gear tradeoffs over "miracle gadget" hype.',
        explanationZh: '欧美户外圈崇尚无痕山林（Leave No Trace）与诚实装备测评，讨厌浮夸“装X神器”叙事。',
        recommendation: 'Emphasize quiet morning rituals in nature and reusable ground-coffee compatibility.',
        recommendationZh: '突出山野清晨安静享受一杯好咖啡的仪式感，远离炫耀式营销。',
      },
    ],
    points: [
      {
        id: 'cf-1',
        original: '军工级航空铝合金机身，搭载黑科技20Bar超强恒温增压泵',
        literal: 'Military-grade aviation aluminum body with black-tech 20Bar constant-temp booster pump.',
        localized: 'Anodized aluminum body with a 20-bar pump built for rich crema miles from the nearest café.',
        highlight: '20-bar pump',
        reason: 'Swaps "military-grade black-tech" clichés for authentic espresso & outdoor gear vocabulary.',
        reasonZh: '去掉“军工级黑科技”套话，转化为咖啡与露营圈认可的“阳极氧化铝机身 + 20-Bar 油脂萃取”。',
      },
      {
        id: 'cf-2',
        original: '92℃精准控温，3秒极速出油脂',
        literal: '92°C precise temperature control, 3-second ultra-fast crema extraction.',
        localized: 'Heats to an espresso-ready 198°F (92°C) for balanced extraction without packing a camp stove.',
        highlight: '198°F (92°C)',
        reason: 'Converts 92°C to 198°F and highlights stove-free convenience instead of implausible 3-second claims.',
        reasonZh: '换算为美制 198°F 经典意式水温，用“免带气罐炉头”的真实便利替代夸张的“3秒极速”。',
      },
      {
        id: 'cf-3',
        original: '内置30000mAh超大容量防爆锂电池',
        literal: 'Built-in 30000mAh extra-large explosion-proof lithium battery.',
        localized: 'High-capacity 30,000 mAh rechargeable battery built for multi-morning weekend campouts.',
        highlight: 'weekend campouts',
        reason: 'Translates raw mAh into weekend camping autonomy and removes alarming "explosion-proof" phrasing.',
        reasonZh: '去掉“防爆”惊吓词，把冰冷的 30,000mAh 电池容量转化为“足够支撑整个周末露营早晨”的场景感知。',
      },
      {
        id: 'cf-4',
        original: '水箱容量80毫升，整机重量仅620克',
        literal: 'Water tank capacity 80 ml, whole machine weight only 620 grams.',
        localized: '2.7 fl. oz. (80 ml) chamber and packable 1.37 lb (620 g) build — sized like a trail bottle.',
        highlight: '2.7 fl. oz. (80 ml)',
        reason: 'Pairs metric specs with US fluid ounces and pounds plus a water-bottle size cue.',
        reasonZh: '补充 2.7 fl. oz. 与 1.37 lbs 英制单位，并以户外水壶作参照帮助买家评估背包重量。',
      },
      {
        id: 'cf-5',
        original: '源头工厂直供性价比无敌，户外露营必备',
        literal: 'Source factory direct supply unbeatable cost-performance, outdoor camping must-have.',
        localized: 'Skip instant coffee packets at sunrise — pull a real shot right from the tailgate.',
        highlight: 'Skip instant coffee',
        reason: 'Replaces factory-price chest-beating with the #1 emotional trigger for camp coffee lovers.',
        reasonZh: '砍掉工厂比价话术，直击欧美露营客“受够了难喝速溶咖啡粉”的清晨痛点。',
      },
    ],
    refinedPoints: [
      {
        localized: '20-bar pressure in a rugged aluminum shell — compatible with fine espresso grounds for easy cleanup.',
        highlight: 'fine espresso grounds',
        reason: 'Clarifies coffee format & cleanup workflow asked by r/espresso & car-camping testers.',
        reasonZh: '根据硬核咖啡玩家反馈，补充粉碗兼容性与户外易清洁说明。',
      },
      {
        localized: 'Cordless 198°F (92°C) heating — or pour in hot kettle water when you want back-to-back group shots.',
        highlight: '198°F (92°C) heating',
        reason: 'Explains both cold-water self-heating and hot-water fast mode honestly.',
        reasonZh: '诚实区分“冷水自加热”与“加热水连萃”两种模式，彻底赢得专业玩家信任。',
      },
      {
        localized: '30,000 mAh USB-C battery powers multiple morning brews before needing a recharge.',
        highlight: '30,000 mAh USB-C',
        reason: 'Notes USB-C car/solar charging convenience for overlanders.',
        reasonZh: '点明支持车载/户外电源 USB-C 补电，精准契合自驾露营（Overlanding）场景。',
      },
      {
        localized: '1.37 lbs (620 g) with a 2.7 fl. oz. (80 ml) tank — built for car camping, vanlife, and cabin trips.',
        highlight: 'car camping, vanlife',
        reason: 'Positions 1.37 lbs honestly for car-campers/vanlifers rather than ultralight thru-hikers.',
        reasonZh: '采纳徒步玩家吐槽：坦诚 1.37 磅更适合自驾露营与房车（Vanlife），不硬蹭超轻徒步，反而极其圈粉！',
      },
      {
        localized: 'Real golden crema at the trailhead — zero gas canisters or bulky kettles required.',
        highlight: 'zero gas canisters',
        reason: 'Highlights fire-ban & stove-free advantage in Western national parks.',
        reasonZh: '突出北美国家公园禁火季（Fire Ban）无需明火气罐也能喝热浓缩的独特刚需！',
      },
    ],
    assetsV1: [
      {
        channel: 'Reddit',
        sections: sectionPairs([
          ['Post Title', 'Brand team here: we built a 1.37 lb (620 g) cordless 20-bar portable espresso maker (198°F / 30,000 mAh) — looking for candid camp-coffee feedback'],
          ['Transparent Brand-authored Post', 'Hey folks — disclosing upfront that I am with the team behind this portable electric espresso maker. Specs in plain numbers: anodized aluminum body, 20-bar pump, 198°F (92°C) target brew temp, 2.7 fl. oz. (80 ml) water chamber, 30,000 mAh battery, and 1.37 lbs (620 g) total weight. For those of you dialing in shots while car camping or overlanding, what workflow annoyances (grind tolerance, puck cleanup, heat time) usually ruin portable machines for you?'],
          ['Community Tone Guidance', 'Never claim café-machine replacement or "3-second magic"; engage openly on weight, heat time, and cleanup.'],
        ]),
        culturalNotes: [
          'Leads with honest weight/capacity numbers and asks about workflow pain points.',
          'Avoids getting downvoted by coffee purists on r/espresso and r/overlanding.',
        ],
        culturalNotesZh: [
          'Reddit 咖啡圈（r/espresso）出了名地挑剔，坦诚列出 1.37 磅重量与 198°F 水温并请教“敲粉饼清洁痛点”是最地道的破冰姿势。',
          '绝不提“秒杀咖啡馆商用机”或“3秒神速”，用实诚态度换取高赞讨论。',
        ],
      },
      {
        channel: 'Instagram',
        visual: {
          headline: 'Trailhead mornings, upgraded.',
          benefits: ['198°F cordless heating · 20-bar pump', '2.7 fl. oz. double-shot tank', '30,000 mAh weekend battery'],
          cta: 'Explore Trail Specs',
        },
        sections: sectionPairs([
          ['Caption', 'Misty ridge, cold air, real crema — no camp stove required.\n\nHeats to 198°F (92°C) on a 30,000 mAh battery and packs into 1.37 lbs of anodized aluminum. Goodbye, sad instant packets.'],
          ['Hashtags', '#CampCoffee #OverlandingGear #VanlifeDiaries #OutdoorCoffee # EspressoAnywhere'],
        ]),
        culturalNotes: [
          'Pairs Obsidian Sage visual theme with misty pine sunrise imagery.',
          'Targets high-spending North American #OverlandingGear and #Vanlife communities.',
        ],
        culturalNotesZh: [
          '告别五金店蓝光海报，锁定消费力极强的北美 #Overlanding（越野自驾露营）与 #Vanlife（房车生活）圈层。',
          '搭配“森系黑曜（Obsidian）”主题色导出海报，高级户外质感拉满。',
        ],
      },
      {
        channel: 'TikTok',
        sections: sectionPairs([
          ['3-second Hook', 'Unpopular camping opinion: waking up in the mountains shouldn’t mean drinking terrible instant coffee.'],
          ['Video Script', '“I didn’t even unpack my camp stove this morning. Pour 2.7 ounces of water in, tap one button, and it heats to 198 degrees Fahrenheit on its built-in 30,000 mAh battery. Look at that crema at 6,000 feet.”'],
          ['Scene Direction', '[Visual] Crisp mountain breath at dawn, silent button press on matte-black cylinder, close-up ASMR of golden espresso pouring into glass cup.'],
          ['CTA', 'See full brew & battery specs in bio.'],
        ]),
        culturalNotes: [
          'Uses outdoor ASMR pour visuals instead of loud voiceover hype.',
          'Contrasts directly against instant coffee packets.',
        ],
        culturalNotesZh: [
          '采用海外 TikTok 最吸粉的“山野清晨 ASMR 原声萃取特写”，不用浮夸配音，让油脂画面自己说话。',
          '前 3 秒用“凭什么露营就得喝难喝速溶”制造轻微观点碰撞，提升完播率。',
        ],
      },
      {
        channel: 'Website',
        visual: {
          headline: 'Real espresso, zero camp stove.',
          benefits: ['198°F (92°C) cordless heating', '20-bar pump · anodized aluminum', '30,000 mAh battery · 1.37 lbs'],
          cta: 'Shop Trail Espresso',
        },
        sections: sectionPairs([
          ['Hero Headline', 'Real espresso, zero camp stove.'],
          ['Subheadline', 'A cordless 20-bar portable espresso maker with 198°F heating and a 30,000 mAh battery for weekend trips off-grid.'],
          ['Product Benefits', 'Heats water to 198°F (92°C) with 20-bar extraction pressure\n2.7 fl. oz. (80 ml) chamber sized for rich outdoor shots\nRugged 1.37 lb (620 g) anodized aluminum body for tailgates and camp kits'],
          ['CTA', 'Shop Trail Espresso'],
        ]),
        culturalNotes: ['Clear US units (198°F / 2.7 fl. oz. / 1.37 lbs) build immediate credibility.'],
        culturalNotesZh: ['首屏全部采用北美用户一目了然的华氏度、液量盎司与磅重，专业户外独立站即视感。'],
      },
      {
        channel: 'B2B Email',
        sections: sectionPairs([
          ['Subject Line', 'Outdoor & specialty gear inquiry: Cordless 198°F / 20-Bar Portable Espresso Maker'],
          ['Email Body', 'Hi [Buyer Name],\n\nReaching out to introduce our cordless 20-bar portable espresso maker (198°F self-heating, 30,000 mAh battery, 1.37 lbs) for your camp kitchen and overland accessories category.\n\nWould you like me to send over our wholesale spec sheet and sample kit details?\n\nBest,\n[Name]'],
          ['Value Proposition', 'High-margin giftable camp-kitchen upgrade with stove-free self-heating.'],
          ['CTA', 'Request wholesale deck & sample'],
        ]),
        culturalNotes: ['Positioned specifically for "camp kitchen & overland" retail buyers (REI/Huckberry style).'],
        culturalNotesZh: ['精准对标北美 REI / Huckberry 等精品户外买手的“营地厨房（Camp Kitchen）”选品语境。'],
      },
    ],
    assetsV2: [
      {
        channel: 'Reddit',
        sections: sectionPairs([
          ['Post Title', 'Brand team here: 1.37 lb cordless 198°F / 20-bar maker built for car camping & fire-ban mornings (not ultralight backpacking) — AMA'],
          ['Transparent Brand-authored Post', 'Appreciate the honest weight callouts! To be 100% upfront: at 1.37 lbs (620 g) with a 30,000 mAh USB-C battery, we built this for car camping, vanlife, and fire-ban national park mornings where camp stoves aren’t allowed — not ultralight thru-hiking. You can either self-heat cold water to 198°F (92°C) or pour hot water in for rapid back-to-back group shots. Happy to answer questions on cleanup and grind size.'],
          ['Community Tone Guidance', 'Owning what the product is NOT for ("not ultralight backpacking") builds massive Reddit trust.'],
        ]),
        culturalNotes: ['Explicitly owning "car camping, not ultralight hiking" turns skeptics into fans!'],
        culturalNotesZh: ['主动承认“专为自驾房车与禁火季设计，而非超轻徒步负重”，在 Reddit 上这种诚实感简直是吸赞神器！'],
      },
      {
        channel: 'Instagram',
        visual: {
          headline: 'Fire-ban friendly morning crema.',
          benefits: ['Stove-free 198°F cordless heating', 'Built for vanlife & car camping', '30,000 mAh USB-C rechargeable'],
          cta: 'See Brew Modes',
        },
        sections: sectionPairs([
          ['Caption', 'Even during summer fire bans when camp stoves stay packed, morning espresso stays on the menu.\n\n198°F cordless heating · 20-bar crema · 30,000 mAh USB-C battery built for tailgates, cabins, and vanlife mornings.'],
          ['Hashtags', '#CarCamping #OverlandKitchen #VanlifeCoffee #CampGear #PortableEspresso'],
        ]),
        culturalNotes: ['Added Western national-park "summer fire ban" use case — huge local insight!'],
        culturalNotesZh: ['切入美西国家公园夏季“禁明火令（Fire Ban）”痛点——不能点气炉照样喝热浓缩，本土洞察满分！'],
      },
      {
        channel: 'TikTok',
        sections: sectionPairs([
          ['3-second Hook', 'Summer fire ban at the campsite = no propane stove. Here is how I still pull hot 198°F espresso.'],
          ['Video Script', '“At 1.37 pounds it stays in my truck camp bin, charges over USB-C, and heats 2.7 ounces of water straight to 198°F without an open flame. Or pour hot kettle water in if you’re pulling shots for the whole crew.”'],
          ['Scene Direction', '[Visual] Truck tailgate setup, USB-C port close-up, rich golden crema pour, quick rinse cleanup shot.'],
          ['CTA', 'Check self-heat vs hot-water brew details in bio.'],
        ]),
        culturalNotes: ['Shows quick rinse cleanup and truck-camp context requested by outdoor testers.'],
        culturalNotesZh: ['补上自驾尾箱场景与快速冲水清洁镜头，彻底打消户外党怕洗机子麻烦的顾虑。'],
      },
      {
        channel: 'Website',
        visual: {
          headline: 'Tailgate espresso. Zero open flame.',
          benefits: ['198°F self-heat or fast hot-water mode', '30,000 mAh USB-C battery · 20-bar', '1.37 lbs — ideal for car camp & vanlife'],
          cta: 'Compare Brew Modes',
        },
        sections: sectionPairs([
          ['Hero Headline', 'Tailgate espresso. Zero open flame.'],
          ['Subheadline', 'Built for car camping, vanlife, and fire-ban mornings — 198°F cordless heating and 20-bar pressure powered by USB-C.'],
          ['Product Benefits', 'Dual workflow: cordless 198°F (92°C) cold-water heating or rapid hot-water extraction\n30,000 mAh USB-C rechargeable battery for multi-day road trips\nDurable 1.37 lb (620 g) anodized aluminum body with 2.7 fl. oz. (80 ml) chamber'],
          ['CTA', 'Compare Brew Modes'],
        ]),
        culturalNotes: ['Honest car-camp positioning + dual brew mode clarity maximizes conversion.'],
        culturalNotesZh: ['清晰展示双萃取模式与自驾场景定位，极大提升转化信任度。'],
      },
      {
        channel: 'B2B Email',
        sections: sectionPairs([
          ['Subject Line', 'Overland & camp-kitchen SKU: Flame-free 198°F USB-C Portable Espresso Maker'],
          ['Email Body', 'Hi [Buyer Name],\n\nSharing our cordless 198°F / 20-bar espresso maker tailored for car-camping and vanlife customers — especially relevant during Western fire-restriction seasons when open-flame stoves are restricted.\n\nBest,\n[Name]'],
          ['Value Proposition', 'Solves camp coffee during seasonal open-flame restrictions.'],
          ['CTA', 'Request wholesale line sheet'],
        ]),
        culturalNotes: ['Seasonal fire-ban angle gives retail buyers a compelling merchandising hook.'],
        culturalNotesZh: ['用“禁火季露营刚需”给渠道买手提供极佳的季节性陈列主题。'],
      },
    ],
    feedback: [
      {
        persona: { id: 'c1', name: 'Marcus Vance', initials: 'MV', profile: 'Denver Overlander & r/camping Moderator', profileZh: '丹佛越野自驾玩家 · 露营社区版主' },
        comment: '1.37 lbs is too heavy for ultralight backpacking, so own it as a car-camping / vanlife beast! Also, no open flame means you can use it during Western summer fire bans — huge selling point.',
        commentZh: '1.37 磅对徒步背包客偏沉，建议大方定位成自驾露营/房车神器！而且不用明火意味着美西夏季禁火期也能在营地做热咖啡，这绝对是大卖点。',
        purchaseInterest: 'High interest',
        purchaseInterestZh: '很有购买意向',
        messageClarity: 'Good specs, sharpen positioning',
        messageClarityZh: '参数实在，场景可更聚焦',
        trustConcerns: 'Be upfront about cold-water heating vs pouring hot water for groups.',
        trustConcernsZh: '希望能诚实写明冷水自加热与直接倒热水连萃的区别。',
      },
      {
        persona: { id: 'c2', name: 'Sofia Rossi', initials: 'SR', profile: 'Seattle Home Barista · Espresso Nerd', profileZh: '西雅图精品咖啡控 · 意式浓缩玩家' },
        comment: 'Converting 92°C to 198°F immediately tells me whoever wrote this actually knows coffee. Just tell me if it takes fine grounds or pods and how annoying cleanup is outdoors.',
        commentZh: '看到把 92°C 换算成 198°F 就知道写文案的人懂行。不过请说明是用咖啡粉还是胶囊，以及在野外好不好清洗。',
        purchaseInterest: 'Considering',
        purchaseInterestZh: '观望考虑',
        messageClarity: 'Clear temp & pressure',
        messageClarityZh: '温压参数专业清晰',
        trustConcerns: 'Wants clarity on coffee format and trailside rinse cleanup.',
        trustConcernsZh: '关心粉碗兼容性与野外少水环境下的清洁便利度。',
      },
      {
        persona: { id: 'c3', name: 'Liam O’Connor', initials: 'LO', profile: 'Portland Weekend Vanlifer', profileZh: '波特兰周末房车旅行玩家' },
        comment: 'Way better vibe with the misty mountain photo than those crazy flames and lasers. Confirm it charges over standard USB-C in my van.',
        commentZh: '晨雾森林这张图比原来那个火焰激光特效顺眼一百倍！只要确认能直接插我车上的 USB-C 充电我就买。',
        purchaseInterest: 'High interest',
        purchaseInterestZh: '很有购买意向',
        messageClarity: 'Very clear',
        messageClarityZh: '画面与卖点很搭',
        trustConcerns: 'Needs confirmation of USB-C车载/移动电源 recharging.',
        trustConcernsZh: '希望确认是否支持通用 USB-C 车载补电。',
      },
    ],
    changesV2: [
      'Positioned 1.37 lbs specifically for car camping, vanlife, and fire-ban mornings.',
      'Clarified dual cold-water self-heating (198°F) vs rapid hot-water group mode.',
      'Highlighted USB-C charging and straightforward ground-coffee cleanup.',
    ],
    changesV2Zh: [
      '精准锚定“自驾房车与美西国家公园禁火季（无需明火气炉）”高价值场景，不硬蹭徒步超轻',
      '透明区分“198°F 冷水自加热”与“加热水多人连萃”双模式，赢得专业咖啡客信任',
      '补充车载 USB-C 充电与咖啡粉易冲洗细节',
    ],
  },
};

export const demoList: DemoPreset[] = [demoPresets.powerbank, demoPresets.beauty, demoPresets.coffee];

export const demoName = demoPresets.powerbank.profile.name;
export const demoInput = demoPresets.powerbank.input;

export function findDemoPreset(input: ProductInput): DemoPreset | undefined {
  if (input.image?.demo && demoPresets[input.image.demo]) {
    const preset = demoPresets[input.image.demo];
    if (!input.description.trim() || input.description.trim() === preset.input.description) {
      return preset;
    }
  }
  const trimmed = input.description.trim();
  return demoList.find(preset => preset.input.description === trimmed);
}

export function buildGenericAssets(profile: ProductProfile, points: SellingPoint[], refined = false): PlatformAsset[] {
  const lead = points[0]?.localized || 'Explore how this product fits into your daily routine.';
  const secondary = points[1]?.localized || 'Thoughtfully localized details tailored to your market.';
  const headline = refined ? 'Refined for everyday confidence.' : 'Designed for your daily routine.';
  const benefits = points.slice(0, 3).map(p => p.localized.slice(0, 68));
  const cta = refined ? 'Review Verified Specs' : 'Explore Product Details';

  return [
    {
      channel: 'TikTok',
      sections: sectionPairs([
        ['3-second Hook', refined ? 'Before you scroll past — here is the everyday detail that actually matters.' : 'Looking for a simpler everyday upgrade? Take a closer look.'],
        ['Video Script', `“${lead} ${secondary}”`],
        ['Scene Direction', '[Visual] Show the real product in natural daylight, demonstrate primary use case in 3 seconds, keep text overlays concise.'],
        ['CTA', cta],
      ]),
      culturalNotes: ['Start with a relatable problem/moment in the first 3 seconds rather than brand slogans.'],
      culturalNotesZh: ['前 3 秒用生活痛点画面切入而非品牌口号，符合海外 TikTok 原生创作者（UGC）调性。'],
    },
    {
      channel: 'Instagram',
      visual: { headline, benefits: benefits.length ? benefits : ['Clean everyday utility'], cta },
      sections: sectionPairs([
        ['Caption', `${headline}\n\n${lead} ${secondary}`],
        ['Hashtags', '#EverydayEssentials #ThoughtfulDesign #ModernLiving #ProductSpotlight'],
      ]),
      culturalNotes: ['Use generous line breaks and pair broad lifestyle tags with niche community tags.'],
      culturalNotesZh: ['正文分段留白，搭配审美化场景底图与分层标签，弱化硬广推销感。'],
    },
    {
      channel: 'Reddit',
      sections: sectionPairs([
        ['Post Title', `Brand team here — sharing specs on ${profile.name} and looking for honest community feedback`],
        ['Transparent Brand-authored Post', `Hi everyone, disclosing upfront that I am with the team behind ${profile.name}. ${lead} What practical details or real-world tests would you want to see before considering it?`],
        ['Community Tone Guidance', 'Disclose brand affiliation in line one; skip exclamation marks and sales urgency.'],
      ]),
      culturalNotes: ['Upfront brand disclosure and zero hype are essential to avoid subreddit moderation removal.'],
      culturalNotesZh: ['Reddit 极度反感隐蔽软文，首句坦诚官方身份并诚恳征集实测问题最易获得正向互动。'],
    },
    {
      channel: 'Website',
      visual: { headline, benefits: benefits.length ? benefits : ['Verified specifications'], cta },
      sections: sectionPairs([
        ['Hero Headline', headline],
        ['Subheadline', lead],
        ['Product Benefits', (benefits.length ? benefits : [lead, secondary]).join('\n')],
        ['CTA', cta],
      ]),
      culturalNotes: ['Keep hero headlines concise and pair metric specs with local measurement units.'],
      culturalNotesZh: ['独立站首屏标题应简洁有力，并确保尺寸重量符合目标市场度量衡习惯。'],
    },
    {
      channel: 'B2B Email',
      sections: sectionPairs([
        ['Subject Line', `Assortment introduction: ${profile.name}`],
        ['Email Body', `Hi [Buyer Name],\n\nI am reaching out to share ${profile.name} for your upcoming category review. ${lead}\n\nWould it be helpful to send over our specification sheet and sample terms?\n\nBest regards,\n[Name]`],
        ['Value Proposition', lead],
        ['CTA', 'Reply to request spec sheet'],
      ]),
      culturalNotes: ['Keep cold B2B emails concise, polite, and centered on spec-sheet verification.'],
      culturalNotesZh: ['海外 B2B 开发信讲究简短克制、礼貌边界清晰，先提供规格书（Spec Sheet）而非强推起订量。'],
    },
  ];
}
