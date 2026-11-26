'use client';

import {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowRight,
  Check,
  Compass,
  Copy,
  Eye,
  FileDown,
  Image as ImageIcon,
  Layers3,
  Palette,
  Play,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type {
  Channel,
  ConsumerFeedback,
  ContentVersion,
  DemoCaseId,
  Locale,
  LocalizationResult,
  VisualTheme,
  WorkflowState,
} from '@/domain/types';
import { exportMarkdownBrief, exportVisualPosterPng } from '@/lib/export-assets';
import { CampaignVisual, channelIcons, Empty, formatSectionLabel, PaneHeading, Skeleton, translate } from './common';
import { Button } from './ui/button';

function Marked({ text, highlight }: { text: string; highlight: string }) {
  const index = highlight ? text.indexOf(highlight) : -1;
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark>{highlight}</mark>
      {text.slice(index + highlight.length)}
    </>
  );
}

interface Props {
  locale: Locale;
  status: WorkflowState['status'];
  result?: LocalizationResult;
  version?: ContentVersion;
  feedback?: ConsumerFeedback[];
  onVersion: (version: 1 | 2) => void;
  channel: Channel;
  visualTheme: VisualTheme;
  onVisualTheme: (theme: VisualTheme) => void;
  onChannel: (channel: Channel) => void;
  onDemo: (id?: DemoCaseId) => void;
}

const themes: Array<{ id: VisualTheme; en: string; zh: string }> = [
  { id: 'indigo', en: 'Editorial Indigo', zh: '深邃靛蓝' },
  { id: 'travertine', en: 'Warm Travertine', zh: '暖石米白' },
  { id: 'obsidian', en: 'Obsidian Sage', zh: '森系黑曜' },
];

export function CreativeWorkspace(p: Props) {
  const t = translate(p.locale);
  const asset = p.version?.assets.find(item => item.channel === p.channel);
  const [copiedKey, setCopiedKey] = useState<{ key: string; ok: boolean }>();
  const [exportState, setExportState] = useState<string>();
  const [showSourceFor, setShowSourceFor] = useState<string>();
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const campaign = useRef<HTMLElement>(null);

  const first = p.result?.versions[0];
  const v2 = p.version?.number === 2;
  const liveCopy = p.version?.source === 'getrun';
  const resultImage = p.result?.image;
  const resultChannels = p.result?.config.channels ?? [];
  const hasCleanAlt = Boolean(resultImage?.cleanSrc);
  const useCleanShot = showSourceFor !== resultImage?.src;
  const activeImageSrc = hasCleanAlt && useCleanShot ? resultImage?.cleanSrc : resultImage?.src;
  const imageLabel = resultImage
    ? hasCleanAlt && useCleanShot
      ? t('Localized clean DTC studio visual', '本地化极简 DTC 场景底图')
      : t('Source product image', '原始商品图')
    : t('Product image area', '商品图片预览区');

  useEffect(() => {
    if (!asset && dialog.current?.open) dialog.current.close();
  }, [asset]);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  async function writeClipboard(key: string, text: string) {
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(text);
      else {
        const field = document.createElement('textarea');
        field.value = text;
        field.className = 'sr-only';
        document.body.append(field);
        field.select();
        try {
          if (!document.execCommand('copy')) throw new Error('Copy failed');
        } finally {
          field.remove();
        }
      }
      setCopiedKey({ key, ok: true });
    } catch {
      setCopiedKey({ key, ok: false });
    }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopiedKey(undefined), 2200);
  }

  function copyFullAsset() {
    if (!asset) return;
    const text = asset.sections.map(({ label, text }) => `${label}\n${text}`).join('\n\n');
    return writeClipboard(`full-${asset.channel}-${p.version?.number ?? 1}`, text);
  }

  function copyAllSellingPoints() {
    if (!p.version?.sellingPoints.length) return;
    const bullets = p.version.sellingPoints.map(pt => `• ${pt.localized}`).join('\n');
    return writeClipboard(`all-points-${p.version.number}`, bullets);
  }

  async function handleExportPng() {
    if (!asset?.visual || !p.result || !p.version) return;
    try {
      const ok = await exportVisualPosterPng({
        asset,
        imageSrc: activeImageSrc,
        theme: p.visualTheme,
        productName: p.result.profile.name,
        versionNumber: p.version.number,
      });
      setExportState(ok ? t('PNG poster exported', '已导出 PNG 海报') : t('Export failed', '导出失败'));
    } catch {
      setExportState(t('Export failed', '导出失败'));
    }
    setTimeout(() => setExportState(undefined), 2600);
  }

  function handleExportMarkdown() {
    if (!p.result || !p.version) return;
    try {
      exportMarkdownBrief({
        productName: p.result.profile.name,
        config: p.result.config,
        version: p.version,
        activeChannel: p.channel,
        risks: p.result.risks,
        feedback: p.feedback,
        locale: p.locale,
      });
      setExportState(t('Markdown brief exported', '已导出 .md 物料包'));
    } catch {
      setExportState(t('Export failed', '导出失败'));
    }
    setTimeout(() => setExportState(undefined), 2600);
  }

  const culturalNotes = asset
    ? p.locale === 'zh'
      ? asset.culturalNotesZh ?? asset.culturalNotes
      : asset.culturalNotes
    : undefined;

  const v2Changes = p.version
    ? p.locale === 'zh'
      ? p.version.changesZh ?? p.version.changes
      : p.version.changes
    : [];

  const profileTitle = p.result
    ? p.locale === 'zh'
      ? p.result.profile.nameZh ? `${p.result.profile.name}（${p.result.profile.nameZh}）` : p.result.profile.name
      : p.result.profile.name
    : '';

  return (
    <section className="pane creative" aria-label={t('Creative Workspace', '创意工作区')}>
      <PaneHeading icon={Layers3} title={t('Creative Workspace', '创意工作区')}>
        {t('Localized messaging and campaign assets', '本地化卖点重构与多平台推广物料')}
      </PaneHeading>
      <div className="pane-scroll creative-scroll">
        {!p.result && p.status !== 'analyzing' && (
          <div className="studio-intro">
            <div className="studio-orbit" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="intro-content">
              <span className="intro-icon">
                <Sparkles size={19} />
              </span>
              <h1>{t('Good products travel well.', '好产品，自有远方。')}</h1>
              <p>
                {t(
                  "Don't just translate your product. Translate why it matters.",
                  '不止于中译英，把中国好产品的卖点重构为海外听得懂的价值。',
                )}
              </p>
              {p.status === 'empty' && (
                <div className="intro-demos">
                  <Button onClick={() => p.onDemo('beauty')}>
                    <Play size={13} />
                    {t('Try Beauty Wand Case', '体验美容仪案例')}
                    <ArrowRight size={14} />
                  </Button>
                  <Button variant="ghost" className="intro-secondary" onClick={() => p.onDemo('coffee')}>
                    {t('Coffee Maker', '便携咖啡机')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {p.result && (
          <div className="product-summary">
            <div>
              <span>{t('Product profile', '商品档案')}</span>
              <strong>{profileTitle}</strong>
              {!!p.result.profile.attributes.length && <p>{p.result.profile.attributes.join(' · ')}</p>}
            </div>
            <div className="result-shortcuts">
              <span className="neutral-pill">
                {liveCopy ? t('GetRun AI Live Copy', 'GetRun AI 实时生成') : t('Curated Demo Copy', '精选本地化方案')}
              </span>
              <button
                type="button"
                onClick={() => {
                  campaign.current?.scrollIntoView({ block: 'start' });
                  campaign.current?.querySelector<HTMLButtonElement>('[aria-selected=true]')?.focus({ preventScroll: true });
                }}
              >
                {t('Jump to channels', '跳至渠道物料')}
                <ArrowDown size={13} />
              </button>
            </div>
          </div>
        )}

        {p.result && p.result.versions.length > 1 && (
          <div className="version-bar">
            <div aria-label={t('Content version', '内容版本')} role="group">
              {([1, 2] as const).map(n => (
                <Button key={n} variant="ghost" aria-pressed={p.version?.number === n} onClick={() => p.onVersion(n)}>
                  {t(`Version ${n}`, `版本 ${n}`)}
                </Button>
              ))}
            </div>
            {v2 && (
              <p>
                <Check size={14} />
                {t('Refined with audience feedback', '已采纳海外受众反馈精修')}
              </p>
            )}
          </div>
        )}

        <section className="workspace-module">
          <header className="module-title">
            <div>
              <ArrowLeftRight size={16} />
              <h3>{t('Selling Point Transformation', '卖点价值重构')}</h3>
            </div>
            {p.version && (
              <div className="module-meta">
                <span>
                  {p.version.sellingPoints.length} {t('selling points', '条卖点对照')}
                </span>
                <button
                  type="button"
                  className={`inline-copy ${copiedKey?.key === `all-points-${p.version.number}` && copiedKey.ok ? 'copied' : ''}`}
                  onClick={copyAllSellingPoints}
                >
                  {copiedKey?.key === `all-points-${p.version.number}` && copiedKey.ok ? <Check size={12} /> : <Copy size={12} />}
                  {copiedKey?.key === `all-points-${p.version.number}` && copiedKey.ok
                    ? t('Copied All', '已复制全部卖点')
                    : t('Copy All Bullets', '复制全部英文卖点')}
                </button>
              </div>
            )}
          </header>
          {p.status === 'analyzing' ? (
            <Skeleton label={t('Diagnosing cultural risks & reframing selling points…', '正在扫描跨文化雷区并重构卖点表达…')} />
          ) : p.version ? (
            <div className="comparison">
              <div className="comparison-head">
                <span>{t('Literal Translation (Risky)', '字面直译（易踩雷）')}</span>
                <span>
                  {liveCopy
                    ? t('Localized Copy (GetRun AI)', '海外本土化重构（GetRun AI）')
                    : t('Localized Copy (Market-ready)', '海外本土化重构（地道英文）')}
                </span>
              </div>
              {p.version.sellingPoints.map(point => {
                const ptKey = `pt-${p.version?.number}-${point.id}`;
                const ptCopied = copiedKey?.key === ptKey && copiedKey.ok;
                return (
                  <article className="point" key={point.id}>
                    <p className="original">
                      <span>{t('Original selling point', '中文原卖点')}</span> {point.original}
                    </p>
                    <div className="compare-row">
                      <p className="literal-col">{point.literal}</p>
                      <div className="localized-col">
                        <div>
                          {v2 && <del>{first?.sellingPoints.find(prior => prior.id === point.id)?.localized}</del>}
                          <p>
                            <Marked text={point.localized} highlight={point.highlight} />
                          </p>
                        </div>
                        <button
                          type="button"
                          className={`inline-copy ${ptCopied ? 'copied' : ''}`}
                          onClick={() => writeClipboard(ptKey, point.localized)}
                          aria-label={t('Copy localized selling point', '复制该条英文卖点')}
                          title={t('Copy pure English bullet', '仅复制该条英文卖点')}
                        >
                          {ptCopied ? <Check size={12} /> : <Copy size={12} />}
                          <span>{ptCopied ? t('Copied', '已复制') : t('Copy', '复制')}</span>
                        </button>
                      </div>
                    </div>
                    <p className="reason">
                      <span>{t('Adaptation rationale', '跨文化调整依据')}</span>{' '}
                      {p.locale === 'zh' ? point.reasonZh ?? point.reason : point.reason}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <Empty icon={ArrowLeftRight} title={t('Your selling points, side by side', '直译 vs 本地化重构并排对照')}>
              {t(
                'Start localization to compare literal translations with market-ready copy.',
                '点击左侧「开始本地化」或顶部「加载演示」，对比生硬直译与地道海外表达。',
              )}
            </Empty>
          )}
        </section>

        <section className="workspace-module" ref={campaign}>
          <header className="module-title">
            <div>
              <Layers3 size={16} />
              <h3>{t('Campaign Assets', '多平台推广物料')}</h3>
            </div>
            {liveCopy && <span>{t('GetRun native tone', 'GetRun 原生语态')}</span>}
          </header>
          <div
            className="platform-tabs"
            role="tablist"
            aria-label={t('Campaign channels', '推广渠道')}
            onKeyDown={e => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
              e.preventDefault();
              const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button'));
              const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
              const next =
                e.key === 'Home'
                  ? 0
                  : e.key === 'End'
                    ? tabs.length - 1
                    : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
              tabs[next]?.focus();
              tabs[next]?.click();
            }}
          >
            {(Object.keys(channelIcons) as Channel[]).map((channel, index) => {
              const Icon = channelIcons[channel];
              return (
                <button
                  type="button"
                  key={channel}
                  id={`channel-${index}`}
                  aria-controls="campaign-panel"
                  tabIndex={p.channel === channel ? 0 : -1}
                  role="tab"
                  aria-selected={p.channel === channel}
                  onClick={() => p.onChannel(channel)}
                >
                  <Icon size={14} />
                  {channel}
                </button>
              );
            })}
          </div>
          <div id="campaign-panel" role="tabpanel" aria-labelledby={`channel-${Object.keys(channelIcons).indexOf(p.channel)}`}>
            {p.status === 'analyzing' || p.status === 'creating' ? (
              <Skeleton
                label={
                  p.status === 'creating'
                    ? t('Diagnostics ready! Generating native channel copy via GetRun…', '诊断已完成！正在通过 GetRun 生成所选渠道原生文案…')
                    : t('Preparing channel assets…', '正在准备多平台推广物料…')
                }
              />
            ) : asset ? (
              <>
                {!resultChannels.includes(p.channel) && (
                  <p className="asset-note">{t('Reference sample for an unselected channel', '该渠道未在生成时勾选，当前展示预置参考样例')}</p>
                )}
                {v2 && !!v2Changes.length && (
                  <div className="v2-banner">
                    <strong>{t('Version 2 refinements:', '版本 2 优化要点：')}</strong>
                    <ul>
                      {v2Changes.map(change => (
                        <li key={change}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {asset.visual && (
                  <>
                    <div className="visual-toolbar">
                      <div className="theme-picker" role="group" aria-label={t('Poster color theme', '海报视觉主题')}>
                        <Palette size={13} />
                        {themes.map(item => (
                          <button
                            key={item.id}
                            type="button"
                            className="theme-pill"
                            aria-pressed={p.visualTheme === item.id}
                            onClick={() => p.onVisualTheme(item.id)}
                          >
                            <i className={`swatch swatch-${item.id}`} />
                            {t(item.en, item.zh)}
                          </button>
                        ))}
                      </div>
                      {hasCleanAlt && (
                        <button
                          type="button"
                          className="clean-toggle"
                          onClick={() =>
                            setShowSourceFor(prev => (prev === resultImage?.src ? undefined : resultImage?.src))
                          }
                        >
                          <ImageIcon size={13} />
                          {useCleanShot
                            ? t('Showing: Clean DTC Shot (Compare Source)', '当前：净版 DTC 场景图（点击对比原海报）')
                            : t('Showing: Original CN Poster (Switch Clean)', '当前：中文大字报原图（切回净版底图）')}
                        </button>
                      )}
                    </div>
                    <CampaignVisual asset={asset} image={activeImageSrc} label={imageLabel} theme={p.visualTheme} />
                  </>
                )}

                <dl className="asset-fields">
                  {asset.sections.map(section => {
                    const secKey = `sec-${asset.channel}-${p.version?.number}-${section.label}`;
                    const secCopied = copiedKey?.key === secKey && copiedKey.ok;
                    return (
                      <div key={section.label}>
                        <dt className="field-dt">
                          <span>{formatSectionLabel(p.locale, section.label)}</span>
                          <button
                            type="button"
                            className={`inline-copy ${secCopied ? 'copied' : ''}`}
                            onClick={() => writeClipboard(secKey, section.text)}
                          >
                            {secCopied ? <Check size={12} /> : <Copy size={12} />}
                            {secCopied ? t('Copied', '已复制') : t('Copy text', '单独复制')}
                          </button>
                        </dt>
                        <dd>{section.text}</dd>
                      </div>
                    );
                  })}
                </dl>

                {!!culturalNotes?.length && (
                  <div className="cultural-notes">
                    <div className="cultural-notes-head">
                      <Compass size={14} />
                      <strong>{t('Cross-Cultural Communication Tips', '跨文化传播提示')}</strong>
                    </div>
                    <ul>
                      {culturalNotes.map(note => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="asset-actions">
                  <Button onClick={copyFullAsset}>
                    {copiedKey?.key === `full-${asset.channel}-${p.version?.number ?? 1}` && copiedKey.ok ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}{' '}
                    {copiedKey?.key === `full-${asset.channel}-${p.version?.number ?? 1}` && copiedKey.ok
                      ? t('Copied All', '已复制整套')
                      : t('Copy Full Channel', '复制整套文案')}
                  </Button>
                  <Button onClick={() => dialog.current?.showModal()}>
                    <Eye size={14} />
                    {t('Preview', '预览')}
                  </Button>
                  {asset.visual ? (
                    <>
                      <Button variant="default" onClick={handleExportPng}>
                        <ArrowDownToLine size={14} />
                        {t('Export PNG Poster', '导出海报 PNG')}
                      </Button>
                      <Button onClick={handleExportMarkdown}>
                        <FileDown size={14} />
                        {t('Export Brief (.md)', '导出方案 (.md)')}
                      </Button>
                    </>
                  ) : (
                    <Button variant="default" onClick={handleExportMarkdown}>
                      <ArrowDownToLine size={14} />
                      {t('Export Asset (.md)', '导出物料 (.md)')}
                    </Button>
                  )}
                  {exportState && <span className="export-toast">{exportState}</span>}
                </div>
                <span role="status" className="copy-status">
                  {copiedKey ? (
                    copiedKey.ok ? (
                      <span className="sr-only">{t('Copied to clipboard.', '已复制到剪贴板。')}</span>
                    ) : (
                      t('Copy failed. Select the text to copy it manually.', '复制失败，可直接选中文字进行复制。')
                    )
                  ) : (
                    ''
                  )}
                </span>
              </>
            ) : (
              <Empty icon={channelIcons[p.channel]} title={t(`${p.channel} preview`, `${p.channel} 物料预览`)}>
                {p.result && !p.version?.assets.length
                  ? t(
                      'Channel generation was paused after brief edits. Click Re-localize to generate channel copy.',
                      '修改简报已中止渠道生成（上方卖点与跨文化诊断已保留），点击左侧「重新本地化」即可生成最新渠道物料。',
                    )
                  : p.result && !resultChannels.includes(p.channel)
                    ? t(
                        'This channel was not selected for this run. Select it on the left and click Re-localize to generate.',
                        '本次生成未勾选该渠道。可在左侧勾选后点击「重新本地化」生成该渠道专属文案。',
                      )
                    : t(
                        'Channel-specific content will appear here after localization.',
                        '完成本地化后，此处将显示适配该海外平台的英文物料与传播提示。',
                      )}
              </Empty>
            )}
          </div>
        </section>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="preview-title"
        onClick={event => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        {asset && (
          <div className="dialog-body">
            <div className="dialog-heading">
              <h2 id="preview-title">
                {asset.channel} {t('Preview', '效果预览')}
              </h2>
              <div className="dialog-actions">
                <Button onClick={copyFullAsset}>
                  {copiedKey?.key === `full-${asset.channel}-${p.version?.number ?? 1}` && copiedKey.ok ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                  {copiedKey?.key === `full-${asset.channel}-${p.version?.number ?? 1}` && copiedKey.ok
                    ? t('Copied', '已复制')
                    : t('Copy All', '复制文案')}
                </Button>
                {asset.visual && (
                  <Button variant="default" onClick={handleExportPng}>
                    <ArrowDownToLine size={14} />
                    {t('Download PNG', '下载 PNG 海报')}
                  </Button>
                )}
                <Button variant="ghost" aria-label={t('Close preview', '关闭预览')} onClick={() => dialog.current?.close()}>
                  <X size={18} />
                </Button>
              </div>
            </div>
            {asset.visual && <CampaignVisual asset={asset} image={activeImageSrc} label={imageLabel} theme={p.visualTheme} />}
            <dl className="asset-fields">
              {asset.sections.map(section => {
                const modalKey = `modal-${asset.channel}-${p.version?.number}-${section.label}`;
                const modalCopied = copiedKey?.key === modalKey && copiedKey.ok;
                return (
                  <div key={section.label}>
                    <dt className="field-dt">
                      <span>{formatSectionLabel(p.locale, section.label)}</span>
                      <button
                        type="button"
                        className={`inline-copy ${modalCopied ? 'copied' : ''}`}
                        onClick={() => writeClipboard(modalKey, section.text)}
                      >
                        {modalCopied ? <Check size={12} /> : <Copy size={12} />}
                        {modalCopied ? t('Copied', '已复制') : t('Copy text', '单独复制')}
                      </button>
                    </dt>
                    <dd>{section.text}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        )}
      </dialog>
    </section>
  );
}
