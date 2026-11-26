'use client';

import { ArrowUpRight, Check, ChevronDown, FileText, ImagePlus, LoaderCircle, Sparkles, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { audiences, channels, markets } from '@/domain/mock-data';
import type { Channel, Locale, ProductInput, WorkflowState } from '@/domain/types';
import { channelIcons, PaneHeading, translate } from './common';
import { Button } from './ui/button';

interface Props {
  input: ProductInput;
  market: string;
  audience: string;
  custom: string;
  selected: Channel[];
  locale: Locale;
  status: WorkflowState['status'];
  onDescription: (value: string) => void;
  onImage: (file?: File) => void;
  onMarket: (value: string) => void;
  onAudience: (value: string) => void;
  onCustom: (value: string) => void;
  onChannel: (value: Channel) => void;
  onStart: () => void;
  imageError: string;
}

export function ProductBrief(p: Props) {
  const t = translate(p.locale);
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const hasInput = Boolean(p.input.image || p.input.description.trim());
  const analyzing = p.status === 'analyzing';
  const disabled = !hasInput || !p.selected.length || (p.audience === 'custom' && !p.custom.trim()) || analyzing || p.status === 'testing';
  return <section className="pane brief" aria-label={t('Product Brief', '商品简报')}>
    <PaneHeading icon={FileText} title={t('Product Brief', '商品简报')}>{t('Source material and settings', '原始素材与推广设置')}</PaneHeading>
    <form id="product-form" className="pane-scroll brief-form" onSubmit={e => { e.preventDefault(); if (!disabled) p.onStart(); }}>
      <div className="form-field">
        <div className="field-line"><label htmlFor="product-image">{t('Product Image', '商品图片')}</label><span>{p.input.image?.demo ? t('Demo illustration', '演示图') : t('Optional', '选填')}</span></div>
        <input id="product-image" className="sr-only" ref={fileInput} type="file" tabIndex={-1} accept="image/png,image/jpeg,image/webp" onChange={e => { if (e.target.files?.[0]) p.onImage(e.target.files[0]); e.target.value = ''; }}/>
        <div className={`upload-zone ${dragging ? 'dragging' : ''} ${p.input.image ? 'has-image' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) p.onImage(e.dataTransfer.files[0]); }}>
          {p.input.image ? <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.input.image.src} alt={p.input.image.demo ? t('Illustrative demo power bank', '充电宝演示图') : p.input.image.name}/>
            <div className="image-toolbar">
              <Button onClick={() => fileInput.current?.click()}><Upload size={13}/>{t('Replace', '替换')}</Button>
              <Button aria-label={t('Remove image', '移除图片')} onClick={() => p.onImage()}><Trash2 size={14}/></Button>
            </div>
          </> : <button className="upload-trigger" type="button" onClick={() => fileInput.current?.click()}>
            <span className="upload-icon"><ImagePlus size={19}/></span>
            <span><b>{t('Click to upload', '点击上传')}</b>{t(' or drag and drop', '或拖放图片')}</span>
            <small>PNG, JPG, WebP</small>
          </button>}
        </div>
        {p.imageError && <p className="input-error" role="alert">{p.imageError}</p>}
      </div>
      <div className="form-field">
        <label htmlFor="description">{t('Product Description', '商品描述')}</label>
        <textarea id="description" value={p.input.description} onChange={e => p.onDescription(e.target.value)} placeholder={t('Paste your original product copy or describe the key selling points…', '粘贴原始宣传文案，或描述主要卖点…')}/>
        <p className="field-hint">{t('Chinese or English source copy', '支持中文或英文原稿')}</p>
      </div>
      <div className="form-divider"/>
      <div className="form-field">
        <label htmlFor="market">{t('Target Market', '目标市场')}</label>
        <div className="select-wrap"><select id="market" value={p.market} onChange={e => p.onMarket(e.target.value)}>{markets.map(m => <option key={m.id} value={m.id}>{t(m.name, m.zh)}</option>)}</select><ChevronDown size={15}/></div>
      </div>
      <div className="form-field">
        <label htmlFor="audience">{t('Target Audience', '目标受众')}</label>
        <div className="select-wrap"><select id="audience" value={p.audience} onChange={e => p.onAudience(e.target.value)}>{audiences.map(a => <option key={a.id} value={a.id}>{t(a.name, a.zh)}</option>)}</select><ChevronDown size={15}/></div>
        {p.audience === 'custom' && <input aria-label={t('Custom audience description', '自定义人群描述')} value={p.custom} onChange={e => p.onCustom(e.target.value)} placeholder={t('Describe your audience', '描述受众')}/>}
      </div>
      <fieldset className="form-field channel-field">
        <legend>{t('Distribution Channels', '分发渠道')}</legend>
        <div className="channel-list">{channels.map(channel => {
          const Icon = channelIcons[channel];
          const active = p.selected.includes(channel);
          return <button type="button" className="channel-chip" aria-pressed={active} key={channel} onClick={() => p.onChannel(channel)}><Icon size={13}/>{channel}{active && <Check size={12}/>}</button>;
        })}</div>
      </fieldset>
    </form>
    <div className="brief-action">
        <Button type="submit" form="product-form" variant="default" disabled={disabled}>
          {analyzing ? <LoaderCircle size={15} className="spin"/> : <Sparkles size={15}/>}
          {analyzing ? t('Analyzing…', '正在分析…') : t('Start Localization', '开始本地化')}
          {!analyzing && <ArrowUpRight className="action-arrow" size={15}/>}
        </Button>
        <p className="field-hint">{!hasInput ? t('Add an image or description to start.', '添加图片或描述后开始。') : !p.selected.length ? t('Select at least one channel.', '至少选择一个渠道。') : p.audience === 'custom' && !p.custom.trim() ? t('Describe your target audience.', '请输入目标受众。') : t('Local translation, with optional GetRun copy.', '本机翻译，可选 GetRun 文案。')}</p>
    </div>
  </section>;
}
