import { ArrowRight, Clapperboard, Globe2, Instagram, Mail, MessageCircle, type LucideIcon } from 'lucide-react';
import type { Channel, Locale, PlatformAsset } from '@/domain/types';

export type Translate = (english: string, chinese: string) => string;
export const translate = (locale: Locale): Translate => (english, chinese) => locale === 'en' ? english : chinese;
export const channelIcons: Record<Channel, LucideIcon> = { TikTok: Clapperboard, Instagram, Reddit: MessageCircle, Website: Globe2, 'B2B Email': Mail };

export function PaneHeading({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return <header className="pane-heading"><span className="pane-icon"><Icon size={18}/></span><div><h2>{title}</h2><p>{children}</p></div></header>;
}

export function Empty({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return <div className="empty-block"><span className="empty-icon"><Icon size={20}/></span><strong>{title}</strong><p>{children}</p></div>;
}

export function Skeleton({ label }: { label: string }) {
  return <div className="skeleton" role="status"><p>{label}</p><i/><i/><i/></div>;
}

export function CampaignVisual({ asset, image, label }: { asset: PlatformAsset; image?: string; label: string }) {
  const visual = asset.visual;
  if (!visual) return null;
  return <div className={`campaign-visual ${asset.channel === 'Instagram' ? 'social-visual' : 'website-visual'}`}>
    <div className="campaign-visual-copy"><h3>{visual.headline}</h3><ul>{visual.benefits.map(benefit => <li key={benefit}>{benefit}</li>)}</ul><span className="preview-cta">{visual.cta}<ArrowRight size={13}/></span></div>
    <div className="campaign-image">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image ? <img src={image} alt={label}/> : <span>{label}</span>}
    </div>
  </div>;
}
