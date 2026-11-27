import { z } from 'zod';
import type { Channel, ZhihuInsightPack, ZhihuReference } from '@/domain/types';

export const maxDuration = 30;

const ZHIHU_SEARCH_URL = 'https://developer.zhihu.com/api/v1/content/zhihu_search';
const ZHIHU_ZHIDA_URL = 'https://developer.zhihu.com/v1/chat/completions';

const channelEnum = z.enum(['TikTok', 'Instagram', 'Reddit', 'Website', 'B2B Email']);
const localeEnum = z.enum(['en', 'zh']);

const searchInputSchema = z.object({
  stage: z.literal('search'),
  query: z.string().trim().max(120).optional(),
  marketId: z.string().trim().max(32).optional(),
  marketZh: z.string().trim().max(40).optional(),
  productNameZh: z.string().trim().max(160).optional(),
  description: z.string().trim().max(2500).optional(),
  channels: z.array(channelEnum).max(5).optional(),
  risks: z
    .array(
      z.object({
        dimension: z.string().max(60),
        level: z.enum(['High', 'Medium', 'Low']),
        original: z.string().max(400),
      }),
    )
    .max(8)
    .optional(),
});

const zhidaInputSchema = z.object({
  stage: z.literal('zhida'),
  locale: localeEnum.default('zh'),
  marketName: z.string().trim().min(1).max(80),
  productName: z.string().trim().min(1).max(160),
  channels: z.array(channelEnum).min(1).max(5),
  risksSummary: z.string().trim().min(1).max(1200),
});

const requestSchema = z.discriminatedUnion('stage', [searchInputSchema, zhidaInputSchema]);

const cacheTtlMs = 15 * 60 * 1000;
const searchCache = new Map<string, { expiresAt: number; items: ZhihuReference[] }>();
const zhidaCache = new Map<string, { expiresAt: number; summary: string }>();

const ipWindowMs = 60 * 60 * 1000;
const maxPublicRequestsPerHour = 45;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function checkPublicRateLimit(request: Request): boolean {
  const host = request.headers.get('host') ?? new URL(request.url).hostname;
  if (/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)) {
    return true;
  }
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown';
  const now = Date.now();
  if (ipHits.size > 500) {
    for (const [k, v] of ipHits) {
      if (v.resetAt <= now) ipHits.delete(k);
    }
  }
  const entry = ipHits.get(ip);
  if (!entry || entry.resetAt <= now) {
    ipHits.set(ip, { count: 1, resetAt: now + ipWindowMs });
    return true;
  }
  if (entry.count >= maxPublicRequestsPerHour) return false;
  entry.count += 1;
  return true;
}

function checkSameOrigin(request: Request, method: 'GET' | 'POST'): boolean {
  const reqUrl = new URL(request.url);
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || reqUrl.protocol.replace(/:$/, '');
  const host =
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() || request.headers.get('host') || reqUrl.host;
  const expectedOrigin = `${proto}://${host}`;

  const site = request.headers.get('sec-fetch-site');
  const rawOrigin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (site && site !== 'same-origin') return false;

  let parsedOrigin: string | null = null;
  if (rawOrigin) {
    try {
      parsedOrigin = new URL(rawOrigin).origin;
    } catch {
      return false;
    }
    if (parsedOrigin !== expectedOrigin && parsedOrigin !== reqUrl.origin) return false;
  }

  if (method === 'POST') {
    return Boolean(parsedOrigin) && (!site || site === 'same-origin');
  }

  return (
    site === 'same-origin' ||
    Boolean(parsedOrigin) ||
    Boolean(
      referer &&
        (referer === expectedOrigin ||
          referer.startsWith(`${expectedOrigin}/`) ||
          referer === reqUrl.origin ||
          referer.startsWith(`${reqUrl.origin}/`)),
    )
  );
}

function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTitle(raw: string): string {
  return stripHtml(raw).replace(/\s*-\s*知乎\s*$/, '').trim();
}

function sanitizeZhihuUrl(raw: string): string {
  try {
    const parsed = new URL(raw);
    if (
      parsed.protocol === 'https:' &&
      (parsed.hostname === 'www.zhihu.com' ||
        parsed.hostname === 'zhuanlan.zhihu.com' ||
        parsed.hostname.endsWith('.zhihu.com'))
    ) {
      return parsed.toString();
    }
  } catch {
    // ignore invalid URL
  }
  return 'https://www.zhihu.com';
}

function extractChineseNoun(productNameZh = '', description = ''): string {
  const cleanedName = productNameZh
    .replace(/[0-9A-Za-z.%+\-_/()（）【】[\]·,，。！!？?：:\s]+/g, ' ')
    .trim();
  const tokens = cleanedName.split(/\s+/).filter(tok => tok.length >= 2);
  if (tokens.length) {
    const last = tokens[tokens.length - 1];
    return last.length > 6 ? last.slice(-4) : last;
  }
  const match = description.match(/([\u4e00-\u9fa5]{2,5}(?:充电宝|移动电源|美容仪|精华|面霜|咖啡机|香薰|耳机|音箱|露营灯|吹风机|吸尘器|支架|背包|手表))/);
  return match ? match[1].slice(-4) : '';
}

export function buildZhihuQueries(input: z.infer<typeof searchInputSchema>): string[] {
  const corpus = `${input.productNameZh ?? ''} ${input.description ?? ''} ${(input.risks ?? []).map(r => r.original).join(' ')}`;
  const marketId = input.marketId ?? 'us';
  const marketLabel =
    marketId === 'me' ? '中东' : marketId === 'eu' ? '欧盟' : marketId === 'uk' ? '英国' : '欧美';
  const chs: Channel[] = input.channels ?? [];

  const candidates: string[] = [];

  // 1. Product + Market compliance/localization query
  if (/充电宝|移动电源|毫安|mAh|Wh|快充|电芯/i.test(corpus)) {
    candidates.push('充电宝 跨境 出海 合规');
    candidates.push('跨境电商 锂电池 空运 MSDS 合规');
  } else if (/美白|淡斑|美容仪|护肤|精华|面霜|胶原|红光|导入|FDA/i.test(corpus)) {
    candidates.push('护肤品 出海 欧美 宣传 合规');
    candidates.push('美妆 出海 功效宣称 合规 红线');
  } else if (/咖啡|意式|萃取|研磨|奶泡|小家电|厨房/i.test(corpus)) {
    candidates.push('小家电 出海 独立站 营销');
    candidates.push('中国品牌 出海 本地化 文案 踩坑');
  } else if (marketId === 'me' || /酒精|红酒|高脚杯|清真|斋月|中东/i.test(corpus)) {
    candidates.push('中东 跨境电商 选品 禁忌');
    candidates.push('出海 中东 宗教 文化 营销');
  } else {
    const noun = extractChineseNoun(input.productNameZh, input.description);
    if (noun) {
      candidates.push(`${noun} 出海 ${marketLabel} 营销`);
    }
    candidates.push(`跨境电商 ${marketLabel} 本土化 避坑`);
    candidates.push('中国品牌 出海 跨文化 营销 案例');
  }

  if (marketId === 'me' && !candidates.some(q => q.includes('中东'))) {
    candidates.splice(1, 0, '中东 跨境电商 选品 禁忌');
  }

  // 2. Channel-specific community playbook query
  if (chs.includes('Reddit')) {
    candidates.push('Reddit 海外推广 防封号 营销');
  } else if (chs.includes('TikTok')) {
    candidates.push('TikTok 出海 本土化 脚本 转化');
  } else if (chs.includes('B2B Email')) {
    candidates.push('外贸 B2B 开发信 海外 采购商');
  } else if (chs.includes('Instagram')) {
    candidates.push('Instagram 出海 品牌 视觉 种草');
  } else if (chs.includes('Website')) {
    candidates.push('跨境 独立站 落地页 转化率 优化');
  }

  const unique: string[] = [];
  for (const q of candidates) {
    const trimmed = q.trim();
    if (trimmed && !unique.includes(trimmed)) unique.push(trimmed);
    if (unique.length >= 3) break;
  }
  return unique.length ? unique : ['跨境电商 品牌出海 本土化 避坑'];
}

function buildFallbackReferences(activeQuery: string, marketId = 'us'): ZhihuReference[] {
  if (/中东|宗教|斋月/.test(activeQuery) || marketId === 'me') {
    return [
      {
        id: 'fb-me-1',
        title: '中东跨境选品与视觉本地化避坑清单：酒精意象、着装规范与礼赠场景',
        excerpt: '进入阿联酋与沙特市场时，含酒精联想要彻底剥离（包括高脚酒杯器型比喻），视觉宜转向家庭待客（Majlis）与节庆礼赠语境。',
        url: 'https://www.zhihu.com/search?type=content&q=%E4%B8%AD%E4%B8%9C%20%E8%B7%A8%E5%A2%83%E7%94%B5%E5%95%86%20%E9%80%89%E5%93%81%20%E7%A6%81%E5%BF%8C',
        author: '跨境合规研究笔记',
        contentType: 'Article',
        voteUpCount: 86,
        commentCount: 12,
      },
      {
        id: 'fb-me-2',
        title: '中国消费品牌出海中东：如何把参数卖点转化为家庭仪式感叙事',
        excerpt: '中东高客单人群对礼盒质感、真实材质说明高度敏感，避免虚构清真或无醇认证，如实标注成分并重构器型美学更稳妥。',
        url: 'https://www.zhihu.com/search?type=content&q=%E5%87%BA%E6%B5%B7%20%E4%B8%AD%E4%B8%9C%20%E6%9C%AC%E5%9C%9F%E5%8C%96%20%E8%90%A5%E9%94%80',
        author: 'MENA出海观察',
        contentType: 'Answer',
        voteUpCount: 54,
        commentCount: 9,
      },
    ];
  }
  if (/护肤|美妆|功效/.test(activeQuery)) {
    return [
      {
        id: 'fb-beauty-1',
        title: '美妆个护出海欧美如何避开功效宣称红线与 Whitening 文化雷区？',
        excerpt: '欧美市场严禁无临床支撑的医疗级承诺，且“美白（Whitening）”易触发肤色议题反感，主流 DTC 品牌普遍改用 Radiant Glow / Even-Toned。',
        url: 'https://www.zhihu.com/search?type=content&q=%E7%BE%8E%E5%A6%86%20%E5%87%BA%E6%B5%B7%20%E5%8A%9F%E6%95%88%E5%AE%A3%E7%A7%B0%20%E5%90%88%E8%A7%84',
        author: '欧美DTC品牌主理人',
        contentType: 'Article',
        voteUpCount: 112,
        commentCount: 19,
      },
      {
        id: 'fb-beauty-2',
        title: '家用美容仪独立站与社媒投放：从功能堆砌到日常护肤仪式感',
        excerpt: '不要出现“媲美医美院线”等易触发 FDA 审核的表述，聚焦温感按摩体验、可验证波长参数与极简视觉更有信服力。',
        url: 'https://www.zhihu.com/search?type=content&q=%E7%BE%8E%E5%AE%B9%E4%BB%AA%20%E5%87%BA%E6%B5%B7%20%E5%90%88%E8%A7%84',
        author: '老林做独立站',
        contentType: 'Answer',
        voteUpCount: 67,
        commentCount: 8,
      },
    ];
  }
  if (/Reddit/i.test(activeQuery)) {
    return [
      {
        id: 'fb-reddit-1',
        title: 'Reddit 出海实测复盘：为什么硬广秒删，透明亮明品牌身份反而高赞？',
        excerpt: 'Subreddit 版主与老用户极度排斥伪装素人的软文和营销口号，主动披露品牌团队身份、坦诚分享参数取舍并开放 AMA 答疑才是正道。',
        url: 'https://www.zhihu.com/search?type=content&q=Reddit%20%E6%B5%B7%E5%A4%96%E6%8E%A8%E5%B9%BF%20%E9%98%B2%E5%B0%81%E5%8F%B7',
        author: '老马聊出海',
        contentType: 'Article',
        voteUpCount: 94,
        commentCount: 16,
      },
      {
        id: 'fb-reddit-2',
        title: '海外社区冷启动避坑：新号养号、版规核查与非促销沟通模板',
        excerpt: '发帖前务必阅读对应板块置顶规则，杜绝“买一送一/清仓”字眼，用真实工程细节换取首批核心用户反馈。',
        url: 'https://www.zhihu.com/search?type=content&q=Reddit%20%E5%85%BB%E5%8F%B7%20%E9%81%BF%E5%9D%91',
        author: '佳佳SEO',
        contentType: 'Article',
        voteUpCount: 52,
        commentCount: 14,
      },
    ];
  }
  return [
    {
      id: 'fb-gen-1',
      title: '跨境电商 3C 与小家电出海欧美：常见广告法违规词与参数本地化指南',
      excerpt: '“销冠王”“100%绝不发热”“防爆”等国内电商高频词在北美极易触发平台下架或安全恐慌，建议切换为瓦时（Wh）登机规范与英制尺寸对照。',
      url: 'https://www.zhihu.com/search?type=content&q=%E8%B7%A8%E5%A2%83%E7%94%B5%E5%95%86%20%E5%87%BA%E6%B5%B7%20%E5%90%88%E8%A7%84%20%E6%96%87%E6%A1%88',
      author: '北美跨境实战派',
      contentType: 'Article',
      voteUpCount: 138,
      commentCount: 24,
    },
    {
      id: 'fb-gen-2',
      title: '从工厂卖点堆砌到海外 DTC 品牌叙事：高转化落地页改写拆解',
      excerpt: '海外消费者更看重具体生活场景（通勤差旅、桌面整洁、晨间萃取）与透明规格，砍掉感叹号轰炸能显著提升独立站信任度。',
      url: 'https://www.zhihu.com/search?type=content&q=%E8%B7%A8%E5%A2%83%20%E7%8B%AC%E7%AB%8B%E7%AB%99%20%E6%9C%AC%E5%9C%9F%E5%8C%96%20%E6%96%87%E6%A1%88',
      author: 'DTC增长笔记',
      contentType: 'Answer',
      voteUpCount: 79,
      commentCount: 11,
    },
  ];
}

interface RawZhihuItem {
  Title?: string;
  ContentType?: string;
  ContentID?: string;
  ContentText?: string;
  Url?: string;
  CommentCount?: number;
  VoteUpCount?: number;
  AuthorName?: string;
  AuthorBadgeText?: string;
  AuthorityLevel?: string;
}

function normalizeItems(rawItems: RawZhihuItem[]): ZhihuReference[] {
  const cleaned: ZhihuReference[] = [];
  const seenTitles = new Set<string>();

  for (const item of rawItems) {
    const title = cleanTitle(String(item.Title ?? ''));
    const fullText = stripHtml(String(item.ContentText ?? ''));
    if (!title || fullText.length < 20 || seenTitles.has(title)) continue;
    seenTitles.add(title);

    const excerpt = fullText.length > 128 ? `${fullText.slice(0, 126).trim()}…` : fullText;
    const rawType = String(item.ContentType ?? '');
    const contentType: ZhihuReference['contentType'] =
      rawType === 'Answer' ? 'Answer' : rawType === 'Article' ? 'Article' : 'Post';

    cleaned.push({
      id: String(item.ContentID || `zh-${cleaned.length}`),
      title,
      excerpt,
      url: sanitizeZhihuUrl(String(item.Url ?? '')),
      author: stripHtml(String(item.AuthorName ?? '')) || '知乎出海答主',
      authorBadge: stripHtml(String(item.AuthorBadgeText ?? '')) || undefined,
      contentType,
      voteUpCount: Math.max(0, Number(item.VoteUpCount ?? 0) || 0),
      commentCount: Math.max(0, Number(item.CommentCount ?? 0) || 0),
      authorityLevel: item.AuthorityLevel ? String(item.AuthorityLevel) : undefined,
    });
  }

  return cleaned.slice(0, 3);
}

async function queryZhihuSearch(
  secret: string,
  query: string,
  parentSignal: AbortSignal,
): Promise<{ ok: true; items: ZhihuReference[] } | { ok: false; reason: 'credentials' | 'quota' | 'upstream' }> {
  const now = Date.now();
  const cached = searchCache.get(query);
  if (cached && cached.expiresAt > now) {
    return { ok: true, items: cached.items };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  const onAbort = () => controller.abort();
  parentSignal.addEventListener('abort', onAbort, { once: true });

  try {
    const url = new URL(ZHIHU_SEARCH_URL);
    url.searchParams.set('Query', query);
    url.searchParams.set('Count', '6');

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secret}`,
        'X-Request-Timestamp': String(Math.floor(Date.now() / 1000)),
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    const json = (await res.json().catch(() => null)) as {
      Code?: number;
      Data?: { Items?: RawZhihuItem[] };
    } | null;

    if (!res.ok || !json || json.Code !== 0) {
      const code = json?.Code;
      if (res.status === 401 || res.status === 403 || code === 20001) return { ok: false, reason: 'credentials' };
      if (res.status === 429 || code === 30001) return { ok: false, reason: 'quota' };
      return { ok: false, reason: 'upstream' };
    }

    const items = normalizeItems(Array.isArray(json.Data?.Items) ? json.Data.Items : []);
    if (items.length) {
      if (searchCache.size > 120) {
        const firstKey = searchCache.keys().next().value;
        if (firstKey) searchCache.delete(firstKey);
      }
      searchCache.set(query, { expiresAt: now + cacheTtlMs, items });
    }
    return { ok: true, items };
  } catch {
    return { ok: false, reason: 'upstream' };
  } finally {
    clearTimeout(timer);
    parentSignal.removeEventListener('abort', onAbort);
  }
}

export async function GET(request: Request) {
  if (!checkSameOrigin(request, 'GET')) {
    return Response.json({ error: 'origin' }, { status: 403 });
  }
  return Response.json({
    configured: Boolean(process.env.ZHIHU_ACCESS_SECRET?.trim()),
  });
}

export async function POST(request: Request) {
  if (!checkSameOrigin(request, 'POST')) {
    return Response.json({ error: 'origin' }, { status: 403 });
  }
  if (!checkPublicRateLimit(request)) {
    return Response.json({ error: 'quota' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'input' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'input' }, { status: 400 });
  }

  const secret = process.env.ZHIHU_ACCESS_SECRET?.trim();
  const payload = parsed.data;

  if (payload.stage === 'search') {
    const suggestedQueries = buildZhihuQueries(payload);
    const activeQuery = payload.query?.trim() || suggestedQueries[0];
    if (!suggestedQueries.includes(activeQuery)) {
      suggestedQueries.unshift(activeQuery);
      suggestedQueries.splice(3);
    }

    if (!secret) {
      const fallbackPack: ZhihuInsightPack = {
        source: 'fallback',
        degradedReason: 'unconfigured',
        activeQuery,
        suggestedQueries,
        items: buildFallbackReferences(activeQuery, payload.marketId),
      };
      return Response.json({ result: fallbackPack });
    }

    let searchRes = await queryZhihuSearch(secret, activeQuery, request.signal);
    let resolvedQuery = activeQuery;

    // Per Zhihu Skill spec: if empty result (not auth/quota failure), shorten/rewrite once
    if (searchRes.ok && searchRes.items.length === 0) {
      const backupQuery = '跨境电商 品牌出海 本土化 避坑';
      if (backupQuery !== activeQuery) {
        const retry = await queryZhihuSearch(secret, backupQuery, request.signal);
        if (retry.ok && retry.items.length > 0) {
          searchRes = retry;
          resolvedQuery = backupQuery;
        }
      }
    }

    if (!searchRes.ok || searchRes.items.length === 0) {
      const degradedReason = !searchRes.ok ? searchRes.reason : 'empty';
      const fallbackPack: ZhihuInsightPack = {
        source: 'fallback',
        degradedReason,
        activeQuery: resolvedQuery,
        suggestedQueries,
        items: buildFallbackReferences(activeQuery, payload.marketId),
      };
      return Response.json({ result: fallbackPack });
    }

    const livePack: ZhihuInsightPack = {
      source: 'live',
      activeQuery: resolvedQuery,
      suggestedQueries,
      items: searchRes.items,
    };
    return Response.json({ result: livePack });
  }

  // payload.stage === 'zhida' (Do NOT auto-retry POST per Zhihu Open Platform spec)
  const cacheKey = `${payload.locale}|${payload.marketName}|${payload.productName}|${payload.channels.join(',')}|${payload.risksSummary.slice(0, 240)}`;
  const cachedZhida = zhidaCache.get(cacheKey);
  if (cachedZhida && cachedZhida.expiresAt > Date.now()) {
    return Response.json({ result: { summary: cachedZhida.summary, source: 'live' as const } });
  }

  const fallbackSummary =
    payload.locale === 'zh'
      ? '1. 剥离绝对化排行与虚构认证，改用可核验规格与目标市场本地单位。\n2. 按渠道调性分层沟通：社媒讲真实场景痛点，社区帖主动亮明品牌身份。\n3. 先用小预算或客群模拟验证信任顾虑，再放大独立站与广告投放。'
      : '1. Replace unverified superlatives with verifiable specs and target-market units.\n2. Adapt tone per channel: creator-style hooks on social, transparent brand disclosure on Reddit.\n3. Address buyer skepticism upfront with concrete everyday use scenarios.';

  if (!secret) {
    return Response.json({
      result: { summary: fallbackSummary, source: 'fallback' as const, degradedReason: 'unconfigured' as const },
    });
  }

  const prompt =
    payload.locale === 'zh'
      ? `你是跨境出海营销顾问。针对【产品：${payload.productName}｜目标市场：${payload.marketName}｜渠道：${payload.channels.join(' / ')}｜待规避风险：${payload.risksSummary}】，请结合知乎跨境从业者实战经验，给出 3 条精炼、可直接执行的出海避坑建议（每条不超过 42 字，直接以 1. 2. 3. 分行输出，不写寒暄或免责声明）。`
      : `You are a cross-border DTC advisor. For [Product: ${payload.productName} | Market: ${payload.marketName} | Channels: ${payload.channels.join(', ')} | Detected Risks: ${payload.risksSummary}], synthesize 3 concise, actionable localization takeaways grounded in real cross-border seller experience (numbered 1. 2. 3. on separate lines, <= 22 words each, no intro/outro).`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18_000);
  const onAbort = () => controller.abort();
  request.signal.addEventListener('abort', onAbort, { once: true });

  try {
    const res = await fetch(ZHIHU_ZHIDA_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'X-Request-Timestamp': String(Math.floor(Date.now() / 1000)),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'zhida-fast-1p5',
        stream: false,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    const json = (await res.json().catch(() => null)) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { code?: string };
    } | null;

    const summary = json?.choices?.[0]?.message?.content?.trim();
    if (!res.ok || !summary) {
      const degradedReason = res.status === 429 ? 'quota' : res.status === 401 || res.status === 403 ? 'credentials' : 'upstream';
      return Response.json({
        result: { summary: fallbackSummary, source: 'fallback' as const, degradedReason },
      });
    }

    if (zhidaCache.size > 80) {
      const firstKey = zhidaCache.keys().next().value;
      if (firstKey) zhidaCache.delete(firstKey);
    }
    zhidaCache.set(cacheKey, { expiresAt: Date.now() + cacheTtlMs, summary });
    return Response.json({ result: { summary, source: 'live' as const } });
  } catch {
    return Response.json({
      result: { summary: fallbackSummary, source: 'fallback' as const, degradedReason: 'upstream' as const },
    });
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener('abort', onAbort);
  }
}
