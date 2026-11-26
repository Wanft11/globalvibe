import { ArrowRight, Clapperboard, Globe2, Instagram, Mail, MessageCircle, type LucideIcon } from 'lucide-react';
import type { Channel, CulturalRisk, Locale, PlatformAsset, VisualTheme } from '@/domain/types';

export type Translate = (english: string, chinese: string) => string;
export const translate = (locale: Locale): Translate => (english, chinese) => (locale === 'en' ? english : chinese);

export const channelIcons: Record<Channel, LucideIcon> = {
  TikTok: Clapperboard,
  Instagram,
  Reddit: MessageCircle,
  Website: Globe2,
  'B2B Email': Mail,
};

const riskDimensionZh: Record<CulturalRisk['dimension'], string> = {
  'Language & Tone': '语言与语态适配',
  'Cultural Sensitivity': '文化敏感度与禁忌',
  'Marketing Claims': '宣传合规与绝对化声明',
  'Visual Adaptation': '视觉审美本地化',
  'Units & Localization': '度量衡与本土规范',
};

export function formatDimension(locale: Locale, dimension: CulturalRisk['dimension']): string {
  return locale === 'zh' ? riskDimensionZh[dimension] : dimension;
}

const sectionLabelZh: Record<string, string> = {
  '3-second Hook': '前 3 秒黄金钩子 (3s Hook)',
  'Video Script': '短视频口播脚本 (Video Script)',
  'Scene Direction': '分镜画面提示 (Scene Direction)',
  CTA: '行动号召 (CTA)',
  Caption: '贴文正文 (Caption)',
  Hashtags: '分层话题标签 (Hashtags)',
  'Post Title': '社区帖标题 (Post Title)',
  'Transparent Brand-authored Post': '去硬广透明互动正文 (Community Post)',
  'Community Tone Guidance': '社区防踩雷准则 (Tone Guidance)',
  'Hero Headline': '首屏主标题 (Hero Headline)',
  Subheadline: '首屏副标题 (Subheadline)',
  'Product Benefits': '核心利益点 (Product Benefits)',
  'Subject Line': '开发信主题 (Subject Line)',
  'Email Body': '开发信正文 (Email Body)',
  'Value Proposition': '渠道合作主张 (Value Proposition)',
};

export function formatSectionLabel(locale: Locale, label: string): string {
  return locale === 'zh' ? sectionLabelZh[label] ?? label : label;
}

export function PaneHeading({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <header className="pane-heading">
      <span className="pane-icon">
        <Icon size={18} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{children}</p>
      </div>
    </header>
  );
}

export function Empty({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div className="empty-block">
      <span className="empty-icon">
        <Icon size={20} />
      </span>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

export function Skeleton({ label }: { label: string }) {
  return (
    <div className="skeleton" role="status">
      <p>{label}</p>
      <i />
      <i />
      <i />
    </div>
  );
}

export function CampaignVisual({
  asset,
  image,
  label,
  theme = 'indigo',
}: {
  asset: PlatformAsset;
  image?: string;
  label: string;
  theme?: VisualTheme;
}) {
  const visual = asset.visual;
  if (!visual) return null;
  return (
    <div className={`campaign-visual theme-${theme} ${asset.channel === 'Instagram' ? 'social-visual' : 'website-visual'}`}>
      <div className="campaign-visual-copy">
        <h3>{visual.headline}</h3>
        <ul>
          {visual.benefits.map(benefit => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
        <span className="preview-cta">
          {visual.cta}
          <ArrowRight size={13} />
        </span>
      </div>
      <div className="campaign-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {image ? <img src={image} alt={label} /> : <span>{label}</span>}
      </div>
    </div>
  );
}
