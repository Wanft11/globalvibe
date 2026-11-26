'use client';

import { ArrowUpRight, Check, ChevronDown, FastForward, FileText, ImagePlus, LoaderCircle, Sparkles, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { audiences, channels, markets } from '@/domain/mock-data';
import type { AiMode, Channel, Locale, ProductInput, WorkflowState } from '@/domain/types';
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
  dirty: boolean;
  aiMode: AiMode;
  getrunConfigured: boolean;
  onDescription: (value: string) => void;
  onImage: (file?: File) => void;
  onMarket: (value: string) => void;
  onAudience: (value: string) => void;
  onCustom: (value: string) => void;
  onChannel: (value: Channel) => void;
  onStart: () => void;
  onSkipToSample?: () => void;
  imageError: string;
}

export function ProductBrief(p: Props) {
  const t = translate(p.locale);
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const hasInput = Boolean(p.input.image || p.input.description.trim());
  const busy = p.status === 'analyzing' || p.status === 'creating';
  const disabled = !hasInput || !p.selected.length || (p.audience === 'custom' && !p.custom.trim()) || busy || p.status === 'testing';

  const statusText = p.status === 'analyzing'
    ? t('Diagnosing & reframing…', '正在跨文化诊断与重构…')
    : p.status === 'creating'
      ? t('Generating channel copy…', '正在生成多渠道物料…')
      : p.dirty
        ? t('Re-localize Brief', '重新本地化')
        : t('Start Localization', '开始本地化');

  const hintText = !hasInput
    ? t('Add an image or description to start.', '添加商品图片或中文卖点描述后开始。')
    : !p.selected.length
      ? t('Select at least one channel.', '请至少勾选一个推广渠道。')
      : p.audience === 'custom' && !p.custom.trim()
        ? t('Describe your target audience.', '请输入自定义受众描述。')
        : p.dirty
          ? t('Brief updated — click above to refresh results.', '简报参数已更新，点击上方按钮重新生成。')
          : p.aiMode === 'live' && p.getrunConfigured
            ? t('Powered by GetRun multimodal localization engine.', '已连接 GetRun 多模态跨文化改写引擎。')
            : t('Instant preset simulation mode active.', '当前为秒出模拟演示模式。');

  return (
    <section className="pane brief" aria-label={t('Product Brief', '商品简报')}>
      <PaneHeading icon={FileText} title={t('Product Brief', '商品简报')}>
        {t('Source material and settings', '原始素材与推广设置')}
      </PaneHeading>
      <form
        id="product-form"
        className="pane-scroll brief-form"
        onSubmit={e => {
          e.preventDefault();
          if (!disabled) p.onStart();
        }}
      >
        <div className="form-field">
          <div className="field-line">
            <label htmlFor="product-image">{t('Product Image', '商品图片')}</label>
            <span>{p.input.image?.demo ? t('Demo poster', '演示素材图') : t('Optional · Vision enabled', '选填 · 支持多模态识图')}</span>
          </div>
          <input
            id="product-image"
            className="sr-only"
            ref={fileInput}
            type="file"
            tabIndex={-1}
            accept="image/png,image/jpeg,image/webp"
            onChange={e => {
              if (e.target.files?.[0]) p.onImage(e.target.files[0]);
              e.target.value = '';
            }}
          />
          <div
            className={`upload-zone ${dragging ? 'dragging' : ''} ${p.input.image ? 'has-image' : ''}`}
            onDragOver={e => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setDragging(false);
              if (e.dataTransfer.files[0]) p.onImage(e.dataTransfer.files[0]);
            }}
          >
            {p.input.image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.input.image.src}
                  alt={p.input.image.demo ? t('Demo product visual', '演示商品原图') : p.input.image.name}
                />
                <div className="image-toolbar">
                  <Button onClick={() => fileInput.current?.click()}>
                    <Upload size={13} />
                    {t('Replace', '替换')}
                  </Button>
                  <Button aria-label={t('Remove image', '移除图片')} onClick={() => p.onImage()}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </>
            ) : (
              <button className="upload-trigger" type="button" onClick={() => fileInput.current?.click()}>
                <span className="upload-icon">
                  <ImagePlus size={19} />
                </span>
                <span>
                  <b>{t('Click to upload', '点击上传')}</b>
                  {t(' or drag and drop', '或拖放海报/商品图')}
                </span>
                <small>PNG, JPG, WebP</small>
              </button>
            )}
          </div>
          {p.imageError && (
            <p className="input-error" role="alert">
              {p.imageError}
            </p>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="description">{t('Product Description', '商品描述')}</label>
          <textarea
            id="description"
            value={p.input.description}
            onChange={e => p.onDescription(e.target.value)}
            placeholder={t(
              'Paste your original Chinese product copy or key selling points…',
              '粘贴国内电商原始宣传文案，或描述核心产品卖点…',
            )}
          />
          <p className="field-hint">{t('Chinese or English source copy', '支持中文卖点原稿或英文草稿')}</p>
        </div>
        <div className="form-divider" />
        <div className="form-field">
          <label htmlFor="market">{t('Target Market', '目标市场')}</label>
          <div className="select-wrap">
            <select id="market" value={p.market} onChange={e => p.onMarket(e.target.value)}>
              {markets.map(m => (
                <option key={m.id} value={m.id}>
                  {t(m.name, m.zh)}
                </option>
              ))}
            </select>
            <ChevronDown size={15} />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="audience">{t('Target Audience', '目标受众')}</label>
          <div className="select-wrap">
            <select id="audience" value={p.audience} onChange={e => p.onAudience(e.target.value)}>
              {audiences.map(a => (
                <option key={a.id} value={a.id}>
                  {t(a.name, a.zh)}
                </option>
              ))}
            </select>
            <ChevronDown size={15} />
          </div>
          {p.audience === 'custom' && (
            <input
              aria-label={t('Custom audience description', '自定义人群描述')}
              value={p.custom}
              onChange={e => p.onCustom(e.target.value)}
              placeholder={t('Describe your audience', '例如：北美周末露营爱好者')}
            />
          )}
        </div>
        <fieldset className="form-field channel-field">
          <legend>{t('Distribution Channels', '分发渠道')}</legend>
          <div className="channel-list">
            {channels.map(channel => {
              const Icon = channelIcons[channel];
              const active = p.selected.includes(channel);
              return (
                <button
                  type="button"
                  className="channel-chip"
                  aria-pressed={active}
                  key={channel}
                  onClick={() => p.onChannel(channel)}
                >
                  <Icon size={13} />
                  {channel}
                  {active && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </fieldset>
      </form>
      <div className="brief-action">
        <Button type="submit" form="product-form" variant="default" disabled={disabled}>
          {busy ? <LoaderCircle size={15} className="spin" /> : <Sparkles size={15} />}
          {statusText}
          {!busy && <ArrowUpRight className="action-arrow" size={15} />}
        </Button>
        {busy && p.onSkipToSample ? (
          <button type="button" className="skip-link" onClick={p.onSkipToSample}>
            <FastForward size={12} />
            {t('Skip wait & show instant preset', '跳过等待，立即展示预置方案')}
          </button>
        ) : (
          <p className="field-hint">{hintText}</p>
        )}
      </div>
    </section>
  );
}
