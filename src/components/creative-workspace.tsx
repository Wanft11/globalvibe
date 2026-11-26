'use client';

import { ArrowDown, ArrowDownToLine, ArrowLeftRight, ArrowRight, Check, Copy, Eye, Layers3, Play, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { hasChinese } from '@/domain/services';
import type { Channel, ContentVersion, LocalizationResult, Locale, ProductInput, WorkflowState } from '@/domain/types';
import { CampaignVisual, channelIcons, Empty, PaneHeading, Skeleton, translate } from './common';
import { Button } from './ui/button';

function Marked({ text, highlight }: { text: string; highlight: string }) {
  const index = highlight ? text.indexOf(highlight) : -1;
  if (index < 0) return text;
  return <>{text.slice(0, index)}<mark>{highlight}</mark>{text.slice(index + highlight.length)}</>;
}

interface Props {
  locale: Locale;
  status: WorkflowState['status'];
  result?: LocalizationResult;
  version?: ContentVersion;
  onVersion: (version: 1 | 2) => void;
  input: ProductInput;
  channel: Channel;
  selected: Channel[];
  onChannel: (channel: Channel) => void;
  onDemo: () => void;
}

export function CreativeWorkspace(p: Props) {
  const t = translate(p.locale);
  const asset = p.version?.assets.find(item => item.channel === p.channel);
  const [copyState, setCopyState] = useState<{ asset: NonNullable<typeof asset>; ok: boolean }>();
  const dialog = useRef<HTMLDialogElement>(null);
  const campaign = useRef<HTMLElement>(null);
  const first = p.result?.versions[0];
  const v2 = p.version?.number === 2;
  const customText = p.result?.profile.source === 'text';
  const liveCopy = p.version?.source === 'getrun';
  const localTranslation = customText && hasChinese(p.input.description);
  const imageLabel = p.input.image?.demo ? t('Illustrative demo power bank', '充电宝演示图') : p.input.image ? t('Original product image', '原始商品图片') : t('Product image area', '商品图片区');
  useEffect(() => {
    if (!asset && dialog.current?.open) dialog.current.close();
  }, [asset]);

  async function copy() {
    if (!asset) return;
    const text = asset.sections.map(({label, text}) => `${label}\n${text}`).join('\n\n');
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(text);
      else {
        const field = document.createElement('textarea');
        field.value = text;
        field.className = 'sr-only';
        document.body.append(field);
        field.select();
        try { if (!document.execCommand('copy')) throw new Error('Copy failed'); }
        finally { field.remove(); }
      }
      setCopyState({ asset, ok: true });
    } catch {
      setCopyState({ asset, ok: false });
    }
  }

  return <section className="pane creative" aria-label={t('Creative Workspace', '创意工作区')}>
    <PaneHeading icon={Layers3} title={t('Creative Workspace', '创意工作区')}>{t('Localized messaging and campaign assets', '本地化文案与推广物料')}</PaneHeading>
    <div className="pane-scroll creative-scroll">
      {!p.result && p.status !== 'analyzing' && <div className="studio-intro">
        <div className="studio-orbit" aria-hidden="true"><i/><i/><i/><i/><i/></div>
        <div className="intro-content">
          <span className="intro-icon"><Sparkles size={19}/></span>
          <h1>{t('Good products travel well.', '好产品，自有远方。')}</h1>
          <p>{t("Don't just translate your product. Translate why it matters.", '跨越语言，把商品价值讲清楚。')}</p>
          {p.status === 'empty' && <Button onClick={p.onDemo}><Play size={13}/>{t('Try the demo', '试用演示')}<ArrowRight size={14}/></Button>}
        </div>
      </div>}
      {p.result && <div className="product-summary">
        <div><span>{t('Product profile', '商品档案')}</span><strong>{p.result.profile.name}</strong>
          {!!p.result.profile.attributes.length && <p>{p.result.profile.attributes.join(' / ')}</p>}</div>
        <div className="result-shortcuts"><span className="neutral-pill">{localTranslation ? t('Local translation', '本地模型翻译') : liveCopy ? t('GetRun campaign copy', 'GetRun 营销文案') : t('Mock results', '模拟结果')}</span>
          <button type="button" onClick={() => { campaign.current?.scrollIntoView({ block: 'start' }); campaign.current?.querySelector<HTMLButtonElement>('[aria-selected=true]')?.focus({ preventScroll: true }); }}>
            {t('Campaign assets', '推广物料')}<ArrowDown size={13}/>
          </button></div>
      </div>}
      {p.result && p.result.versions.length > 1 && <div className="version-bar">
        <div aria-label={t('Content version', '内容版本')} role="group">
          {([1, 2] as const).map(n => <Button key={n} variant="ghost" aria-pressed={p.version?.number === n} onClick={() => p.onVersion(n)}>{t(`Version ${n}`, `版本 ${n}`)}</Button>)}
        </div>
        {v2 && <p><Check size={14}/>{t('Refined with simulated feedback', '依据模拟反馈优化')}</p>}
      </div>}
      <section className="workspace-module">
        <header className="module-title"><div><ArrowLeftRight size={16}/><h3>{t('Selling Point Transformation', '卖点重构')}</h3></div>{p.version && <span>{p.version.sellingPoints.length} {t('selling points', '个卖点')}</span>}</header>
        {p.status === 'analyzing' ? <Skeleton label={t('Reframing selling points…', '正在重构卖点…')}/> : p.version ? <div className="comparison">
          <div className="comparison-head"><span>{t('Literal Translation', '直译')}</span><span>{liveCopy ? t('Localized Copy (GetRun)', '本地化文案（GetRun）') : customText ? t('Localized Copy (sample)', '本地化文案（示例）') : t('Localized Copy', '本地化文案')}</span></div>
          {p.version.sellingPoints.map(point => <article className="point" key={point.id}>
            <p className="original"><span>{t('Original selling point', '原始卖点')}</span> {point.original}</p>
            <div className="compare-row">
              <p>{point.literal}</p>
              <div>{v2 && <del>{first?.sellingPoints.find(prior => prior.id === point.id)?.localized}</del>}<p><Marked text={point.localized} highlight={point.highlight}/></p></div>
            </div>
            <p className="reason"><span>{t('Adaptation', '调整依据')}</span> {point.reason}</p>
          </article>)}
        </div> : <Empty icon={ArrowLeftRight} title={t('Your selling points, side by side', '并排查看卖点')} >{t('Start localization to compare literal translations with market-ready copy.', '开始本地化以查看直译与本地化文案的对照。')}</Empty>}
      </section>
      <section className="workspace-module" ref={campaign}>
        <header className="module-title"><div><Layers3 size={16}/><h3>{t('Campaign Assets', '推广物料')}</h3></div>{liveCopy ? <span>{t('GetRun copy', 'GetRun 文案')}</span> : localTranslation && <span>{t('Sample copy', '示例文案')}</span>}</header>
        <div className="platform-tabs" role="tablist" aria-label={t('Campaign channels', '推广渠道')} onKeyDown={e => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
          e.preventDefault();
          const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button'));
          const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
          const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          tabs[next]?.focus();
          tabs[next]?.click();
        }}>{(Object.keys(channelIcons) as Channel[]).map((channel, index) => {
          const Icon = channelIcons[channel];
          return <button type="button" key={channel} id={`channel-${index}`} aria-controls="campaign-panel" tabIndex={p.channel === channel ? 0 : -1} role="tab" aria-selected={p.channel === channel} onClick={() => p.onChannel(channel)}><Icon size={14}/>{channel}</button>;
        })}</div>
        <div id="campaign-panel" role="tabpanel" aria-labelledby={`channel-${Object.keys(channelIcons).indexOf(p.channel)}`}>
          {p.status === 'analyzing' ? <Skeleton label={t('Preparing channel assets…', '正在生成渠道物料…')}/> : asset ? <>
            {!p.selected.includes(p.channel) && <p className="asset-note">{t('Reference sample for an unselected channel', '未选渠道的参考示例')}</p>}
            {v2 && <p className="asset-note">{p.version?.changes.join(' ')}</p>}
            {asset.visual && <CampaignVisual asset={asset} image={p.input.image?.src} label={imageLabel}/>}
            <dl className="asset-fields">{asset.sections.map(section => <div key={section.label}><dt>{section.label}</dt><dd>{section.text}</dd></div>)}</dl>
            <div className="asset-actions">
              <Button onClick={copy}>{copyState?.asset === asset && copyState.ok ? <Check size={14}/> : <Copy size={14}/>} {copyState?.asset === asset && copyState.ok ? t('Copied', '已复制') : t('Copy Text', '复制文案')}</Button>
              <Button onClick={() => dialog.current?.showModal()}><Eye size={14}/>{t('Preview', '预览')}</Button>
              <Button disabled><ArrowDownToLine size={14}/>{t('Export Asset', '导出物料')}</Button>
              <span>{t('Export unavailable', '暂不可导出')}</span>
            </div>
            <span role="status" className="copy-status">{copyState?.asset === asset ? copyState.ok ? <span className="sr-only">{t('Campaign copy copied.', '已复制文案。')}</span> : t('Copy failed. Select the text to copy it manually.', '复制失败，可直接选中文字进行复制。') : ''}</span>
          </> : <Empty icon={channelIcons[p.channel]} title={t(`${p.channel} preview`, `${p.channel} 预览`)}>{t('Channel-specific content will appear here after localization.', '本地化完成后，此处将显示对应渠道内容。')}</Empty>}
        </div>
      </section>
    </div>
    <dialog ref={dialog} aria-labelledby="preview-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      {asset && <div className="dialog-body"><div className="dialog-heading"><h2 id="preview-title">{asset.channel} {t('Preview', '预览')}</h2><Button variant="ghost" aria-label={t('Close preview', '关闭预览')} onClick={() => dialog.current?.close()}><X size={18}/></Button></div>
        {asset.visual && <CampaignVisual asset={asset} image={p.input.image?.src} label={imageLabel}/>}
        <dl className="asset-fields">{asset.sections.map(section => <div key={section.label}><dt>{section.label}</dt><dd>{section.text}</dd></div>)}</dl>
      </div>}
    </dialog>
  </section>;
}
