import type {
  Channel,
  ConsumerFeedback,
  ContentVersion,
  CulturalRisk,
  Locale,
  LocalizationConfig,
  PlatformAsset,
  VisualTheme,
} from '@/domain/types';

export async function compressImageToDataUrl(srcOrFile: File | string, maxEdge = 960): Promise<string | undefined> {
  try {
    const img = await loadImage(typeof srcOrFile === 'string' ? srcOrFile : URL.createObjectURL(srcOrFile));
    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    if (typeof srcOrFile !== 'string') URL.revokeObjectURL(img.src);
    return canvas.toDataURL('image/jpeg', 0.82);
  } catch {
    return undefined;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

const themePalettes: Record<
  VisualTheme,
  {
    bg: string;
    imageBg: string;
    title: string;
    body: string;
    ctaBg: string;
    ctaText: string;
    ctaBorder: string;
    tag: string;
  }
> = {
  indigo: {
    bg: '#25204b',
    imageBg: '#e7e3fc',
    title: '#ffffff',
    body: '#e1ddfa',
    ctaBg: 'rgba(255,255,255,0.12)',
    ctaText: '#ffffff',
    ctaBorder: 'rgba(255,255,255,0.34)',
    tag: '#bfb4fd',
  },
  travertine: {
    bg: '#f5f0e8',
    imageBg: '#ebe3d5',
    title: '#241f1a',
    body: '#5c5349',
    ctaBg: '#241f1a',
    ctaText: '#faf7f2',
    ctaBorder: '#241f1a',
    tag: '#8b7355',
  },
  obsidian: {
    bg: '#161b19',
    imageBg: '#242c29',
    title: '#f2f5f3',
    body: '#b8c4be',
    ctaBg: '#dce8e1',
    ctaText: '#161b19',
    ctaBorder: '#dce8e1',
    tag: '#86a897',
  },
};

function wrapCanvasLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
      if (lines.length === maxLines - 1) {
        for (let j = i + 1; j < words.length; j++) {
          const next = `${current} ${words[j]}`;
          if (ctx.measureText(`${next}…`).width <= maxWidth) current = next;
          else {
            current = `${current}…`;
            break;
          }
        }
        lines.push(current);
        return lines;
      }
    }
  }
  lines.push(current);
  return lines.slice(0, maxLines);
}

function drawCoverOrContainImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  mode: 'cover' | 'contain',
) {
  const iw = img.naturalWidth || 1;
  const ih = img.naturalHeight || 1;
  const scale = mode === 'cover' ? Math.max(w / iw, h / ih) : Math.min((w * 0.88) / iw, (h * 0.88) / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 36) || 'globalvibe-asset'
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function exportVisualPosterPng(opts: {
  asset: PlatformAsset;
  imageSrc?: string;
  theme: VisualTheme;
  productName: string;
  versionNumber: number;
}): Promise<boolean> {
  try {
    const { asset, imageSrc, theme, productName, versionNumber } = opts;
    if (!asset.visual) return false;
    const palette = themePalettes[theme];
    const isInstagram = asset.channel === 'Instagram';
    const width = isInstagram ? 1080 : 1440;
    const height = isInstagram ? 1350 : 760;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    const imgX = isInstagram ? 0 : Math.round(width * 0.52);
    const imgY = 0;
    const imgW = isInstagram ? width : width - imgX;
    const imgH = isInstagram ? Math.round(height * 0.56) : height;

    ctx.fillStyle = palette.imageBg;
    ctx.fillRect(imgX, imgY, imgW, imgH);

    if (imageSrc) {
      try {
        const img = await loadImage(imageSrc);
        const isTransparentOrIcon = imageSrc.endsWith('.webp') || img.naturalWidth < 600;
        drawCoverOrContainImage(ctx, img, imgX, imgY, imgW, imgH, isTransparentOrIcon ? 'contain' : 'cover');
      } catch {
        // Fallback placeholder background remains visible if image load fails
      }
    }

    const copyX = isInstagram ? 72 : 84;
    const copyW = isInstagram ? width - 144 : Math.round(width * 0.52) - 156;
    let cursorY = isInstagram ? imgH + 68 : 120;

    ctx.fillStyle = palette.tag;
    ctx.font = '600 21px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(productName.toUpperCase().slice(0, 42), copyX, cursorY);
    cursorY += 54;

    ctx.fillStyle = palette.title;
    const headlineSize = isInstagram ? 58 : 56;
    ctx.font = `600 ${headlineSize}px Georgia, "Iowan Old Style", serif`;
    const headlineLines = wrapCanvasLines(ctx, asset.visual.headline, copyW, 3);
    for (const line of headlineLines) {
      ctx.fillText(line, copyX, cursorY);
      cursorY += Math.round(headlineSize * 1.16);
    }
    cursorY += 16;

    ctx.fillStyle = palette.body;
    ctx.font = '500 26px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
    for (const benefit of asset.visual.benefits.slice(0, 3)) {
      const bulletLines = wrapCanvasLines(ctx, `•  ${benefit}`, copyW, 2);
      for (const line of bulletLines) {
        ctx.fillText(line, copyX, cursorY);
        cursorY += 36;
      }
      cursorY += 6;
    }

    cursorY += 22;
    const ctaLabel = `${asset.visual.cta}  →`;
    ctx.font = '600 24px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
    const ctaPaddingX = 30;
    const ctaW = Math.min(copyW, Math.ceil(ctx.measureText(ctaLabel).width) + ctaPaddingX * 2);
    const ctaH = 58;

    ctx.fillStyle = palette.ctaBg;
    ctx.strokeStyle = palette.ctaBorder;
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, copyX, cursorY, ctaW, ctaH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = palette.ctaText;
    ctx.fillText(ctaLabel, copyX + ctaPaddingX, cursorY + 37);

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return false;
    triggerDownload(
      blob,
      `${slugify(productName)}-${asset.channel.toLowerCase()}-v${versionNumber}-${theme}.png`,
    );
    return true;
  } catch {
    return false;
  }
}

export function exportMarkdownBrief(opts: {
  productName: string;
  config: LocalizationConfig;
  version: ContentVersion;
  activeChannel: Channel;
  risks: CulturalRisk[];
  feedback?: ConsumerFeedback[];
  locale: Locale;
}) {
  const { productName, config, version, activeChannel, risks, feedback, locale } = opts;
  const isZh = locale === 'zh';
  const asset = version.assets.find(a => a.channel === activeChannel) ?? version.assets[0];

  const lines: string[] = [
    `# GlobalVibe ${isZh ? '跨境营销本地化物料包' : 'Cross-Border Localization Pack'} — ${productName}`,
    '',
    `- **${isZh ? '目标市场' : 'Target Market'}**: ${isZh ? config.market.zh : config.market.name}`,
    `- **${isZh ? '目标受众' : 'Target Audience'}**: ${isZh ? config.audience.zh : config.audience.name}`,
    `- **${isZh ? '当前版本' : 'Version'}**: V${version.number} (${version.source === 'getrun' ? 'GetRun AI' : 'Preset Demo'})`,
    `- **${isZh ? '导出渠道' : 'Primary Channel'}**: ${activeChannel}`,
    '',
  ];

  if (asset) {
    lines.push(`## 1. ${activeChannel} ${isZh ? '推广物料（英文成稿）' : 'Campaign Copy'}`);
    lines.push('');
    for (const sec of asset.sections) {
      lines.push(`### ${sec.label}`);
      lines.push(sec.text);
      lines.push('');
    }
    const notes = isZh ? asset.culturalNotesZh ?? asset.culturalNotes : asset.culturalNotes;
    if (notes?.length) {
      lines.push(`### ${isZh ? '跨文化传播提示' : 'Cross-Cultural Guidance'}`);
      for (const note of notes) lines.push(`- ${note}`);
      lines.push('');
    }
  }

  lines.push(`## 2. ${isZh ? '卖点重构对照' : 'Selling Point Reconstruction'}`);
  lines.push('');
  for (const sp of version.sellingPoints) {
    const reason = isZh ? sp.reasonZh ?? sp.reason : sp.reason;
    lines.push(`- **${isZh ? '原始卖点' : 'Source'}**: ${sp.original}`);
    lines.push(`  - **${isZh ? '直译' : 'Literal'}**: ${sp.literal}`);
    lines.push(`  - **${isZh ? '本地化表达' : 'Localized'}**: ${sp.localized}`);
    lines.push(`  - **${isZh ? '调整依据' : 'Rationale'}**: ${reason}`);
  }
  lines.push('');

  if (risks.length) {
    lines.push(`## 3. ${isZh ? '跨文化风险诊断' : 'Cross-Cultural Diagnostics'}`);
    lines.push('');
    for (const r of risks) {
      const exp = isZh ? r.explanationZh ?? r.explanation : r.explanation;
      const rec = isZh ? r.recommendationZh ?? r.recommendation : r.recommendation;
      lines.push(`- **[${r.level}] ${r.dimension}** (${r.original})`);
      lines.push(`  - ${isZh ? '说明' : 'Issue'}: ${exp}`);
      lines.push(`  - ${isZh ? '建议' : 'Action'}: ${rec}`);
    }
    lines.push('');
  }

  if (feedback?.length) {
    lines.push(`## 4. ${isZh ? '虚拟焦点小组反馈' : 'Virtual Focus Group Feedback'}`);
    lines.push('');
    for (const fb of feedback) {
      const concern = isZh ? fb.trustConcernsZh ?? fb.trustConcerns : fb.trustConcerns;
      lines.push(`- **${fb.persona.name}** (${isZh ? fb.persona.profileZh ?? fb.persona.profile : fb.persona.profile}): "${fb.comment}"`);
      if (isZh && fb.commentZh) lines.push(`  - 中文参考: ${fb.commentZh}`);
      lines.push(`  - ${isZh ? '信任顾虑' : 'Trust Concern'}: ${concern}`);
    }
    lines.push('');
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, `${slugify(productName)}-${activeChannel.toLowerCase().replace(/\s+/g, '-')}-v${version.number}.md`);
}
