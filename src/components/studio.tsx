'use client';

import {
  AudioLines,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileInput,
  FlaskConical,
  Globe2,
  Languages,
  Radar,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  CampaignError,
  checkGetRunStatus,
  runGetRunChannels,
  runGetRunDiagnose,
  runGetRunFocusGroup,
  runGetRunRefine,
  type GetRunStatus,
} from '@/domain/campaign-client';
import { audiences, channels, demoList, demoPresets, findDemoPreset, markets } from '@/domain/mock-data';
import { mockServices } from '@/domain/mock-services';
import { localizationServices } from '@/domain/services';
import type {
  AiMode,
  Channel,
  ConsumerFeedback,
  DemoCaseId,
  Locale,
  LocalizationConfig,
  ProductInput,
  VisualTheme,
  WorkflowState,
} from '@/domain/types';
import { compressImageToDataUrl } from '@/lib/export-assets';
import { translate } from './common';
import { CreativeWorkspace } from './creative-workspace';
import { Intelligence } from './intelligence';
import { ProductBrief } from './product-brief';
import { Button } from './ui/button';

const emptyInput: ProductInput = { description: '' };
const steps = [
  { label: 'Input', zh: '输入', icon: FileInput },
  { label: 'Diagnose', zh: '诊断', icon: Radar },
  { label: 'Create', zh: '创作', icon: Sparkles },
  { label: 'Validate', zh: '验证', icon: FlaskConical },
];

export function Studio() {
  const [locale, setLocale] = useState<Locale>('zh');
  const [getrun, setGetrun] = useState<GetRunStatus>({ configured: false, model: null });
  const [aiMode, setAiMode] = useState<AiMode>('mock');
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [visualTheme, setVisualTheme] = useState<VisualTheme>('indigo');

  const [input, setInput] = useState<ProductInput>(emptyInput);
  const [market, setMarket] = useState('us');
  const [audience, setAudience] = useState('general');
  const [custom, setCustom] = useState('');
  const [selected, setSelected] = useState<Channel[]>(['TikTok', 'Instagram', 'Website']);
  const [dirty, setDirty] = useState(false);

  const [flow, setFlow] = useState<WorkflowState>({ status: 'empty' });
  const [channel, setChannel] = useState<Channel>('TikTok');
  const [version, setVersion] = useState<1 | 2>(1);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState<'localize' | 'test' | 'refine'>();
  const [imageError, setImageError] = useState(false);
  const [campaignError, setCampaignError] = useState<string>();

  const campaignRequest = useRef<AbortController>(null);
  const demoMenuRef = useRef<HTMLDivElement>(null);
  const blobUrls = useRef<Set<string>>(new Set());
  const operation = useRef(0);

  const t = translate(locale);
  const result = 'result' in flow ? flow.result : undefined;
  const feedback = 'feedback' in flow ? flow.feedback : undefined;
  const activeVersion = result?.versions.find(item => item.number === version);
  const step =
    flow.status === 'empty' || flow.status === 'ready'
      ? 0
      : flow.status === 'analyzing'
        ? 1
        : flow.status === 'creating' || flow.status === 'generated'
          ? 2
          : 3;

  const matchedPreset = findDemoPreset(input);
  const project = result
    ? locale === 'zh'
      ? result.profile.nameZh ?? result.profile.name
      : result.profile.name
    : matchedPreset
      ? locale === 'zh'
        ? matchedPreset.profile.nameZh ?? matchedPreset.profile.name
        : matchedPreset.profile.name
      : t('Untitled project', '未命名项目');

  useEffect(() => {
    checkGetRunStatus().then(status => {
      setGetrun(status);
      if (status.configured) setAiMode('live');
    });
  }, []);

  useEffect(() => {
    const activeSrcs = new Set([input.image?.src, result?.image?.src].filter(Boolean));
    for (const url of Array.from(blobUrls.current)) {
      if (!activeSrcs.has(url)) {
        URL.revokeObjectURL(url);
        blobUrls.current.delete(url);
      }
    }
  }, [input.image?.src, result?.image?.src]);

  useEffect(() => {
    const urls = blobUrls.current;
    return () => {
      campaignRequest.current?.abort();
      for (const url of Array.from(urls)) {
        URL.revokeObjectURL(url);
      }
      urls.clear();
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : 'en';
  }, [locale]);

  useEffect(() => {
    if (!demoMenuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (demoMenuRef.current && !demoMenuRef.current.contains(e.target as Node)) {
        setDemoMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [demoMenuOpen]);

  function buildConfig(mktId = market, audId = audience, customText = custom, chs = selected): LocalizationConfig {
    const baseAudience = audiences.find(item => item.id === audId) ?? audiences[4];
    return {
      market: markets.find(item => item.id === mktId) ?? markets[0],
      audience: audId === 'custom' ? { ...baseAudience, name: customText.trim(), zh: customText.trim() } : baseAudience,
      channels: [...chs],
    };
  }

  function markEdited(nextInput = input) {
    operation.current++;
    campaignRequest.current?.abort();
    setCampaignError(undefined);
    setError(undefined);
    setRefining(false);
    const hasBrief = Boolean(nextInput.image || nextInput.description.trim());
    if (!result) {
      setDirty(false);
      setFlow({ status: hasBrief ? 'ready' : 'empty' });
      return;
    }
    if (flow.status === 'creating' || flow.status === 'testing') {
      setFlow({ status: 'generated', result });
    }
    setDirty(true);
  }

  function updateInput(next: ProductInput) {
    setInput(next);
    markEdited(next);
  }

  async function updateImage(file?: File) {
    if (file && !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setImageError(true);
      return;
    }
    setImageError(false);
    if (!file) {
      updateInput({ ...input, image: undefined });
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    blobUrls.current.add(blobUrl);
    const dataUrl = await compressImageToDataUrl(file);
    updateInput({ ...input, image: { src: blobUrl, dataUrl, name: file.name } });
  }

  async function loadDemo(caseId: DemoCaseId = 'powerbank') {
    const preset = demoPresets[caseId];
    const presetConfig = buildConfig(preset.market, preset.audience, '', preset.channels);
    setDemoMenuOpen(false);
    operation.current++;
    campaignRequest.current?.abort();
    setCampaignError(undefined);
    setError(undefined);
    setRefining(false);
    setImageError(false);
    setDirty(false);
    setVersion(1);

    setMarket(preset.market);
    setAudience(preset.audience);
    setCustom('');
    setSelected(preset.channels);
    setChannel(preset.channels[0]);
    setVisualTheme(caseId === 'beauty' ? 'travertine' : caseId === 'coffee' ? 'obsidian' : 'indigo');

    const baseImage = preset.input.image;
    setInput(preset.input);

    setFlow({
      status: 'generated',
      result: {
        profile: preset.profile,
        config: presetConfig,
        image: preset.input.image,
        risks: preset.risks,
        versions: [
          {
            number: 1,
            source: 'mock',
            sellingPoints: preset.points,
            assets: preset.assetsV1,
            changes: [],
          },
        ],
      },
    });

    if (baseImage?.src) {
      const dataUrl = await compressImageToDataUrl(baseImage.src);
      if (dataUrl) {
        setInput(prev => (prev.image?.src === baseImage.src ? { ...prev, image: { ...prev.image, dataUrl } } : prev));
      }
    }
  }

  function reset() {
    operation.current++;
    campaignRequest.current?.abort();
    setInput(emptyInput);
    setMarket('us');
    setAudience('general');
    setCustom('');
    setSelected(['TikTok', 'Instagram', 'Website']);
    setChannel('TikTok');
    setVisualTheme('indigo');
    setDirty(false);
    setRefining(false);
    setVersion(1);
    setError(undefined);
    setCampaignError(undefined);
    setImageError(false);
    setFlow({ status: 'empty' });
  }

  async function fallbackToPresetOrMock(
    run: number,
    snapshotInput: ProductInput,
    settings: LocalizationConfig,
    warningCode?: string,
  ) {
    const baseProfile = await localizationServices.analyzeProduct(snapshotInput);
    if (run !== operation.current) return;
    const [risks, sellingPoints] = await Promise.all([
      localizationServices.diagnoseCulture(snapshotInput, baseProfile, settings),
      localizationServices.localizeSellingPoints(snapshotInput, baseProfile, settings),
    ]);
    if (run !== operation.current) return;
    const assets = await localizationServices.generatePlatformAssets(baseProfile, sellingPoints, settings);
    if (run !== operation.current) return;
    setDirty(false);
    setCampaignError(warningCode);
    setFlow({
      status: 'generated',
      result: {
        profile: baseProfile,
        config: settings,
        image: snapshotInput.image,
        risks,
        versions: [{ number: 1, source: 'mock', sellingPoints, assets, changes: [] }],
      },
    });
  }

  async function skipWaitToSample() {
    const run = ++operation.current;
    campaignRequest.current?.abort();
    await fallbackToPresetOrMock(run, input, buildConfig());
  }

  async function localize() {
    if ((!input.image && !input.description.trim()) || !selected.length || (audience === 'custom' && !custom.trim())) return;
    const run = ++operation.current;
    const settings = buildConfig();
    const snapshotInput: ProductInput = {
      description: input.description,
      image: input.image ? { ...input.image } : undefined,
    };
    setError(undefined);
    setCampaignError(undefined);
    setDirty(false);
    setVersion(1);
    setFlow({ status: 'analyzing' });
    if (!settings.channels.includes(channel)) setChannel(settings.channels[0]);

    try {
      const useLive = aiMode === 'live' && getrun.configured;
      if (!useLive) {
        await fallbackToPresetOrMock(run, snapshotInput, settings);
        return;
      }

      const baseProfile = await mockServices.analyzeProduct(snapshotInput);
      if (run !== operation.current) return;
      const seedPoints = await mockServices.localizeSellingPoints(snapshotInput, baseProfile, settings);
      if (run !== operation.current) return;

      let readyInput = snapshotInput;
      if (snapshotInput.image?.src && !snapshotInput.image.dataUrl) {
        const dataUrl = await compressImageToDataUrl(snapshotInput.image.src);
        if (dataUrl) readyInput = { ...snapshotInput, image: { ...snapshotInput.image, dataUrl } };
      }

      const controller = new AbortController();
      campaignRequest.current = controller;

      try {
        const diagnosed = await runGetRunDiagnose(readyInput, seedPoints, settings, locale, controller.signal);
        if (run !== operation.current) return;
        if (!diagnosed) {
          await fallbackToPresetOrMock(run, readyInput, settings);
          return;
        }

        const partialVersion = {
          number: 1 as const,
          source: 'getrun' as const,
          sellingPoints: diagnosed.sellingPoints,
          assets: [],
          changes: [],
        };
        setFlow({
          status: 'creating',
          result: {
            profile: diagnosed.profile,
            config: settings,
            image: readyInput.image,
            risks: diagnosed.risks,
            versions: [partialVersion],
          },
        });

        const liveAssets = await runGetRunChannels(
          diagnosed.profile,
          readyInput.description,
          diagnosed.sellingPoints,
          settings,
          locale,
          controller.signal,
        );
        if (run !== operation.current) return;
        if (!liveAssets?.length) {
          await fallbackToPresetOrMock(run, readyInput, settings, 'output');
          return;
        }

        setFlow({
          status: 'generated',
          result: {
            profile: diagnosed.profile,
            config: settings,
            image: readyInput.image,
            risks: diagnosed.risks,
            versions: [{ ...partialVersion, assets: liveAssets }],
          },
        });
      } catch (failure) {
        if (run !== operation.current) return;
        const code = failure instanceof CampaignError ? failure.message : 'upstream';
        await fallbackToPresetOrMock(run, readyInput, settings, code);
      }
    } catch {
      if (run === operation.current) {
        setFlow({ status: 'ready' });
        setError('localize');
      }
    }
  }

  async function testConsumers() {
    if ((flow.status !== 'generated' && flow.status !== 'feedback-ready' && flow.status !== 'refined') || !result) return;
    const run = ++operation.current;
    const settings = result.config;
    const targetVersion = activeVersion ?? result.versions.at(-1)!;
    setError(undefined);
    setCampaignError(undefined);
    setFlow({ status: 'testing', result, feedback: [] });

    const useLive = aiMode === 'live' && getrun.configured;
    if (useLive) {
      const controller = new AbortController();
      campaignRequest.current = controller;
      try {
        const liveFeedback = await runGetRunFocusGroup(result.profile, targetVersion, settings, locale, controller.signal);
        if (run !== operation.current) return;
        if (liveFeedback?.length) {
          setFlow({ status: 'feedback-ready', result, feedback: liveFeedback });
          return;
        }
      } catch (failure) {
        if (run !== operation.current) return;
        setCampaignError(failure instanceof CampaignError ? failure.message : 'upstream');
      }
    }

    try {
      const collected: ConsumerFeedback[] = [];
      for await (const response of localizationServices.simulateConsumers(result.profile, targetVersion, settings)) {
        if (run !== operation.current) return;
        collected.push(response);
        setFlow({ status: 'testing', result, feedback: [...collected] });
      }
      if (run === operation.current) setFlow({ status: 'feedback-ready', result, feedback: collected });
    } catch {
      if (run === operation.current) {
        setFlow({ status: 'generated', result });
        setError('test');
      }
    }
  }

  async function refine() {
    if (flow.status !== 'feedback-ready' || refining) return;
    const run = ++operation.current;
    const { result: currentResult, feedback: currentFeedback } = flow;
    const settings = currentResult.config;
    setError(undefined);
    setRefining(true);
    setCampaignError(undefined);
    const v1 = currentResult.versions[0];
    const baseVersion = activeVersion ?? v1;

    try {
      const useLive = aiMode === 'live' && getrun.configured;
      if (useLive) {
        const controller = new AbortController();
        campaignRequest.current = controller;
        try {
          const refinedLive = await runGetRunRefine(
            currentResult.profile,
            baseVersion,
            currentFeedback,
            settings,
            locale,
            controller.signal,
          );
          if (run !== operation.current) return;
          if (refinedLive) {
            if (!settings.channels.includes(channel)) setChannel(settings.channels[0]);
            setFlow({
              status: 'refined',
              result: { ...currentResult, versions: [v1, refinedLive] },
              feedback: currentFeedback,
            });
            setVersion(2);
            return;
          }
          if (v1.source === 'getrun') {
            setCampaignError('output');
            return;
          }
        } catch (failure) {
          if (run !== operation.current) return;
          const code = failure instanceof CampaignError ? failure.message : 'upstream';
          if (v1.source === 'getrun') {
            setCampaignError(code);
            return;
          }
          setCampaignError(code);
        }
      }

      if (v1.source === 'getrun') {
        setCampaignError('config');
        return;
      }

      const refinedMock = await localizationServices.refineContent(currentResult.profile, baseVersion, currentFeedback, settings);
      if (run !== operation.current) return;
      setFlow({
        status: 'refined',
        result: { ...currentResult, versions: [v1, refinedMock] },
        feedback: currentFeedback,
      });
      setVersion(2);
    } catch {
      if (run === operation.current) setError('refine');
    } finally {
      if (run === operation.current) setRefining(false);
    }
  }

  const statusLabels: Record<WorkflowState['status'], string> = {
    empty: t('Waiting for a product brief', '等待输入中文商品简报或加载演示案例'),
    ready: t('Ready to localize', '已就绪，点击「开始本地化」启动重构'),
    analyzing: t('Step 1/2 · Diagnosing cultural landmines & reframing points…', '第 1/2 步 · 正在诊断跨文化风险并重构核心卖点…'),
    creating: t('Step 2/2 · Diagnostics ready, generating channel copy…', '第 2/2 步 · 卖点诊断已就绪，正在生成多渠道英文物料…'),
    generated: t('Campaign assets & cultural tips ready', '推广物料与跨文化提示已生成'),
    testing: t('Running virtual overseas focus group…', '正在模拟海外目标消费者测试…'),
    'feedback-ready': t('Audience feedback ready — click Refine for V2', '海外受众反馈已生成，可一键精修版本 2'),
    refined: t('Version 2 refined & ready for export', '版本 2 已精修完成，支持导出 PNG 海报与方案'),
  };

  const errorMessage =
    error === 'localize'
      ? t('Localization failed. Try starting it again.', '本地化处理失败，请重试。')
      : error === 'test'
        ? t('Virtual test failed. Run it again.', '虚拟客群测试失败，请重试。')
        : t('Refinement failed. Try again.', '版本优化失败，请重试。');

  const campaignMessages: Record<string, string> = {
    config: t('Check GetRun model configuration in .env.local.', '请检查 .env.local 中的 GetRun 模型配置。'),
    credentials: t('Check GetRun API key permissions.', '请检查 GetRun API Key 权限或有效性。'),
    quota: t('GetRun rate limit or quota reached.', 'GetRun 触发速率或额度限制。'),
    timeout: t('GetRun response timed out.', 'GetRun 响应超时。'),
    output: t('GetRun returned an unexpected format.', 'GetRun 返回结构解析异常。'),
    upstream: t('GetRun live request did not complete.', 'GetRun 实时请求未完成。'),
  };
  const campaignMessage = campaignError
    ? `${campaignMessages[campaignError] ?? campaignMessages.upstream} ${
        flow.status === 'feedback-ready' && result?.versions[0]?.source === 'getrun'
          ? t('Version 1 preserved — click Refine to retry.', '已完好保留版本 1 原稿，可点击重试精修。')
          : t('Showing fallback copy.', '已自动切换为兜底方案展示。')
      }`
    : '';

  return (
    <div className="studio-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-icon">
              <Globe2 size={21} />
            </span>
            <strong>
              GlobalVibe<span>.</span>
            </strong>
          </div>
          <div className="breadcrumb">
            <span>{t('Localization Studio', '跨境营销本地化工作台')}</span>
            <ChevronRight size={13} />
            <strong title={project}>{project}</strong>
          </div>
          <div className="top-actions">
            <div className="demo-dropdown" ref={demoMenuRef}>
              <Button onClick={() => setDemoMenuOpen(open => !open)} aria-expanded={demoMenuOpen} aria-haspopup="menu">
                <Sparkles size={14} />
                {t('Load Demo', '加载演示案例')}
                <ChevronDown size={13} />
              </Button>
              {demoMenuOpen && (
                <div className="demo-menu" role="menu">
                  {demoList.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      className="demo-menu-item"
                      onClick={() => loadDemo(item.id)}
                    >
                      <strong>{t(item.labelEn, item.labelZh)}</strong>
                      <small>{t(item.tagEn, item.tagZh)}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw size={14} />
              <span className="reset-label">{t('Reset', '重置')}</span>
            </Button>
            <Button
              className="language"
              variant="ghost"
              onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
              aria-label={t('Switch to Chinese', '切换为英文界面')}
            >
              <Languages size={16} />
              {locale === 'en' ? '中文' : 'EN'}
            </Button>
          </div>
        </div>
      </header>

      <div className="workflow-strip">
        <div className="workflow-inner">
          <span className="workflow-title">
            <AudioLines size={16} />
            {t('Workflow', '全链路工作流')}
          </span>
          <ol className="steps" aria-label={t('Workflow progress', '工作流进度')}>
            {steps.map(({ label, zh, icon: Icon }, index) => (
              <li key={label} aria-current={step === index ? 'step' : undefined} className={step > index ? 'passed' : ''}>
                <span className="step-icon">
                  {step > index || flow.status === 'refined' ? <Check size={14} /> : <Icon size={14} />}
                </span>
                <span>{t(label, zh)}</span>
                {index < steps.length - 1 && <ChevronRight className="step-separator" size={13} />}
              </li>
            ))}
          </ol>
          <button
            type="button"
            className={`simulation ${aiMode === 'live' && getrun.configured ? 'live-badge' : ''}`}
            disabled={!getrun.configured}
            onClick={() => setAiMode(mode => (mode === 'live' ? 'mock' : 'live'))}
            title={
              getrun.configured
                ? t('Click to switch between GetRun Live AI and Instant Simulation', '点击切换「GetRun 实时 AI 生成」与「秒出模拟演示」')
                : t('Add GETRUN_API_KEY in .env.local to enable live mode', '在 .env.local 配置 GETRUN_API_KEY 即可启用实时 AI')
            }
          >
            {aiMode === 'live' && getrun.configured ? <Zap size={13} /> : <FlaskConical size={13} />}
            <span>
              {aiMode === 'live' && getrun.configured
                ? t('GetRun AI Live', 'GetRun AI 实时模式')
                : t('Simulation Mode', '模拟演示模式')}
            </span>
          </button>
        </div>
      </div>

      <main className="workbench">
        <ProductBrief
          input={input}
          market={market}
          audience={audience}
          custom={custom}
          selected={selected}
          locale={locale}
          status={flow.status}
          dirty={dirty}
          aiMode={aiMode}
          getrunConfigured={getrun.configured}
          onDescription={description => updateInput({ ...input, description })}
          onImage={updateImage}
          onMarket={value => {
            setMarket(value);
            markEdited();
          }}
          onAudience={value => {
            setAudience(value);
            markEdited();
          }}
          onCustom={value => {
            setCustom(value);
            markEdited();
          }}
          onChannel={value => {
            setSelected(channels.filter(item => (item === value ? !selected.includes(item) : selected.includes(item))));
            markEdited();
          }}
          onStart={localize}
          onSkipToSample={aiMode === 'live' ? skipWaitToSample : undefined}
          imageError={imageError ? t('Choose a PNG, JPG, or WebP image.', '请选择 PNG、JPG 或 WebP 图片。') : ''}
        />
        <CreativeWorkspace
          locale={locale}
          status={flow.status}
          result={result}
          version={activeVersion}
          feedback={feedback}
          onVersion={setVersion}
          channel={channel}
          visualTheme={visualTheme}
          onVisualTheme={setVisualTheme}
          onChannel={setChannel}
          onDemo={loadDemo}
        />
        <Intelligence
          locale={locale}
          flow={flow}
          aiMode={aiMode}
          getrunConfigured={getrun.configured}
          refining={refining}
          onTest={testConsumers}
          onRefine={refine}
        />
      </main>

      <footer className="statusbar">
        <span role={error || campaignError ? 'alert' : 'status'}>
          <AudioLines size={14} />
          {error
            ? errorMessage
            : campaignError
              ? campaignMessage
              : refining
                ? t('Refining campaign assets…', '正在根据客群反馈优化版本 2…')
                : statusLabels[flow.status]}
        </span>
        <span>
          <CircleHelp size={13} />
          {t('GlobalVibe · Cross-Cultural Localization Engine', 'GlobalVibe · 跨境跨文化本地化引擎')}
        </span>
      </footer>
    </div>
  );
}
