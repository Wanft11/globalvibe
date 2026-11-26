'use client';

import { AudioLines, Check, ChevronRight, CircleHelp, FileInput, FlaskConical, Globe2, Languages, Radar, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CampaignError, generateCampaign } from '@/domain/campaign-client';
import { audiences, channels, demoInput, demoName, markets } from '@/domain/mock-data';
import { hasChinese, localizationServices, LocalTranslationError } from '@/domain/services';
import type { Channel, ConsumerFeedback, LocalizationConfig, Locale, ProductInput, WorkflowState } from '@/domain/types';
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
  const [locale, setLocale] = useState<Locale>('en');
  const [input, setInput] = useState<ProductInput>(emptyInput);
  const [market, setMarket] = useState('us');
  const [audience, setAudience] = useState('general');
  const [custom, setCustom] = useState('');
  const [selected, setSelected] = useState<Channel[]>(['TikTok', 'Instagram', 'Website']);
  const [flow, setFlow] = useState<WorkflowState>({ status: 'empty' });
  const [channel, setChannel] = useState<Channel>('TikTok');
  const [version, setVersion] = useState<1 | 2>(1);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState<'localize' | 'test' | 'refine' | 'invalid-input' | 'unavailable'>();
  const [imageError, setImageError] = useState(false);
  const [campaignError, setCampaignError] = useState<string>();
  const campaignRequest = useRef<AbortController>(null);
  const operation = useRef(0);
  const t = translate(locale);
  const result = 'result' in flow ? flow.result : undefined;
  const activeVersion = result?.versions.find(item => item.number === version);
  const step = flow.status === 'empty' || flow.status === 'ready' ? 0 : flow.status === 'analyzing' ? 1 : flow.status === 'generated' ? 2 : 3;
  const project = result?.profile.name || (input.description.trim() === demoInput.description ? demoName : t('Untitled project', '未命名项目'));
  const objectUrl = input.image?.src.startsWith('blob:') ? input.image.src : undefined;

  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, [objectUrl]);
  useEffect(() => { document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : 'en'; }, [locale]);

  useEffect(() => () => campaignRequest.current?.abort(), []);

  function invalidate(nextInput = input) {
    operation.current++;
    campaignRequest.current?.abort();
    setCampaignError(undefined);
    setFlow({ status: nextInput.image || nextInput.description.trim() ? 'ready' : 'empty' });
    setRefining(false);
    setVersion(1);
    setError(undefined);
  }

  function updateInput(next: ProductInput) {
    setInput(next);
    invalidate(next);
  }

  function updateImage(file?: File) {
    if (file && !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setImageError(true);
      return;
    }
    setImageError(false);
    updateInput({ ...input, image: file ? { src: URL.createObjectURL(file), name: file.name } : undefined });
  }

  function loadDemo() {
    updateInput(demoInput);
    setMarket('us');
    setAudience('professional');
    setCustom('');
    setSelected(channels.filter(item => item !== 'B2B Email'));
    setChannel('TikTok');
    setImageError(false);
  }

  function reset() {
    updateInput(emptyInput);
    setMarket('us');
    setAudience('general');
    setCustom('');
    setSelected(['TikTok', 'Instagram', 'Website']);
    setChannel('TikTok');
    setImageError(false);
    setLocale('en');
  }

  function config(): LocalizationConfig {
    const baseAudience = audiences.find(item => item.id === audience) ?? audiences[4];
    return {
      market: markets.find(item => item.id === market) ?? markets[0],
      audience: audience === 'custom' ? { ...baseAudience, name: custom.trim(), zh: custom.trim() } : baseAudience,
      channels: selected,
    };
  }

  async function localize() {
    if ((!input.image && !input.description.trim()) || !selected.length || (audience === 'custom' && !custom.trim())) return;
    const run = ++operation.current;
    const settings = config();
    setError(undefined);
    setCampaignError(undefined);
    setVersion(1);
    setFlow({ status: 'analyzing' });
    setChannel(selected[0]);
    try {
      const profile = await localizationServices.analyzeProduct(input);
      if (run !== operation.current) return;
      const [risks, sellingPoints] = await Promise.all([
        localizationServices.diagnoseCulture(input, profile, settings),
        localizationServices.localizeSellingPoints(input, profile, settings),
      ]);
      if (run !== operation.current) return;
      let live;
      let warning: string | undefined;
      if (input.description.trim()) {
        const controller = new AbortController();
        campaignRequest.current = controller;
        try {
          live = await generateCampaign(sellingPoints, settings, controller.signal);
        } catch (failure) {
          warning = failure instanceof CampaignError ? failure.message : 'upstream';
        }
      }
      if (run !== operation.current) return;
      const content = live ?? {
        number: 1 as const, source: 'mock' as const, sellingPoints,
        assets: await localizationServices.generatePlatformAssets(profile, sellingPoints, settings), changes: [],
      };
      if (run === operation.current) {
        setCampaignError(warning);
        setFlow({ status: 'generated', result: { profile, risks, versions: [content] } });
      }
    } catch (error) {
      if (run === operation.current) {
        setFlow({ status: 'ready' });
        setError(error instanceof LocalTranslationError ? error.code : 'localize');
      }
    }
  }

  async function testConsumers() {
    if (flow.status !== 'generated') return;
    const run = ++operation.current;
    const { result } = flow;
    const feedback: ConsumerFeedback[] = [];
    setError(undefined);
    setFlow({ status: 'testing', result, feedback: [] });
    try {
      for await (const response of localizationServices.simulateConsumers(result.profile, result.versions[0], config())) {
        if (run !== operation.current) return;
        feedback.push(response);
        setFlow({ status: 'testing', result, feedback: [...feedback] });
      }
      if (run === operation.current) setFlow({ status: 'feedback-ready', result, feedback });
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
    const { result, feedback } = flow;
    setError(undefined);
    setRefining(true);
    setCampaignError(undefined);
    const previous = result.versions[0];
    try {
      const controller = new AbortController();
      campaignRequest.current = controller;
      const refined = previous.source === 'getrun'
        ? await generateCampaign(previous.sellingPoints, config(), controller.signal, feedback)
        : await localizationServices.refineContent(result.profile, previous, feedback, config());
      if (!refined) throw new CampaignError('config');
      if (run !== operation.current) return;
      setFlow({ status: 'refined', result: { ...result, versions: [...result.versions, refined] }, feedback });
      setVersion(2);
    } catch (failure) {
      if (run === operation.current) {
        if (previous.source === 'getrun') setCampaignError(failure instanceof CampaignError ? failure.message : 'upstream');
        else setError('refine');
      }
    } finally {
      if (run === operation.current) setRefining(false);
    }
  }

  const statusLabels: Record<WorkflowState['status'], string> = {
    empty: t('Waiting for a product brief', '等待商品简报'), ready: t('Ready to localize', '可开始本地化'),
    analyzing: hasChinese(input.description) && input.description.trim() !== demoInput.description
      ? t('Translating on this machine. First use downloads the model.', '正在本机翻译。首次使用需要下载模型。')
      : t('Analyzing product and market', '正在分析商品与市场'), generated: t('Campaign assets ready', '推广物料已生成'),
    testing: t('Collecting simulated feedback', '正在收集模拟反馈'), 'feedback-ready': t('Audience feedback ready', '受众反馈已生成'),
    refined: t('Version 2 ready', '版本 2 已生成'),
  };
  const errorMessage = error === 'localize' ? t('Localization failed. Try starting it again.', '本地化失败，请重试。')
    : error === 'invalid-input' ? t('Split long Chinese text into selling points of up to 240 characters.', '请将较长中文文案拆成每条最多 240 字的卖点。')
    : error === 'unavailable' ? t('Local translation could not start. Check connectivity for the first model download, then try again.', '本地翻译未能启动。首次下载模型需要联网，请检查连接后重试。')
    : error === 'test' ? t('Virtual test failed. Run it again.', '虚拟测试失败，请重试。')
    : t('Refinement failed. Try again.', '优化失败，请重试。');
  const campaignMessages: Record<string, string> = {
    config: t('Check the GetRun model ID and settings in .env.local.', '请检查 .env.local 中的 GetRun 模型 ID 和配置。'),
    credentials: t('Check the GetRun Key and model access.', '请检查 GetRun 密钥和模型权限。'),
    quota: t('GetRun reported a quota or rate limit error.', 'GetRun 返回额度或速率限制错误。'),
    timeout: t('The GetRun request timed out.', 'GetRun 请求超时。'),
    output: t('GetRun returned incomplete copy.', 'GetRun 返回的文案不完整。'),
    upstream: t('GetRun generation could not complete.', 'GetRun 生成未完成。'),
  };
  const campaignMessage = campaignError
    ? (campaignMessages[campaignError] ?? campaignMessages.upstream) + ' ' +
      (flow.status === 'feedback-ready' ? t('Version 1 is still available.', '版本 1 可继续使用。') : t('Sample campaign copy is shown.', '当前显示示例营销文案。'))
    : '';


  return <div className="studio-shell">
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand"><span className="brand-icon"><Globe2 size={21}/></span><strong>GlobalVibe<span>.</span></strong></div>
        <div className="breadcrumb"><span>{t('Localization Studio', '本地化工作台')}</span><ChevronRight size={13}/><strong title={project}>{project}</strong></div>
        <div className="top-actions">
          <Button onClick={loadDemo}><Sparkles size={14}/>{t('Load Demo', '加载演示')}</Button>
          <Button variant="ghost" onClick={reset}><RotateCcw size={14}/><span className="reset-label">{t('Reset', '重置')}</span></Button>
          <Button className="language" variant="ghost" onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')} aria-label={t('Switch to Chinese', '切换为英文')}><Languages size={16}/>{locale === 'en' ? 'EN' : '中文'}</Button>
        </div>
      </div>
    </header>
    <div className="workflow-strip">
      <div className="workflow-inner">
        <span className="workflow-title"><AudioLines size={16}/>{t('Workflow', '工作流')}</span>
        <ol className="steps" aria-label={t('Workflow progress', '工作流进度')}>
          {steps.map(({label, zh, icon: Icon}, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={step > index ? 'passed' : ''}>
            <span className="step-icon">{step > index || flow.status === 'refined' ? <Check size={14}/> : <Icon size={14}/>}</span><span>{t(label, zh)}</span>{index < steps.length - 1 && <ChevronRight className="step-separator" size={13}/>}
          </li>)}
        </ol>
        <span className="simulation"><FlaskConical size={13}/><span>{activeVersion?.source === 'getrun' ? t('Simulated feedback', '模拟反馈') : t('Simulation mode', '模拟模式')}</span></span>
      </div>
    </div>
    <main className="workbench">
      <ProductBrief input={input} market={market} audience={audience} custom={custom} selected={selected} locale={locale} status={flow.status}
        onDescription={description => updateInput({ ...input, description })}
        onImage={updateImage}
        onMarket={value => { setMarket(value); invalidate(); }}
        onAudience={value => { setAudience(value); invalidate(); }}
        onCustom={value => { setCustom(value); invalidate(); }}
        onChannel={value => { setSelected(channels.filter(item => item === value ? !selected.includes(item) : selected.includes(item))); invalidate(); }}
        onStart={localize} imageError={imageError ? t('Choose a PNG, JPG, or WebP image.', '请选择 PNG、JPG 或 WebP 图片。') : ''}/>
      <CreativeWorkspace locale={locale} status={flow.status} result={result} version={activeVersion} onVersion={setVersion} input={input} channel={channel} selected={selected} onChannel={setChannel} onDemo={loadDemo}/>
      <Intelligence locale={locale} flow={flow} refining={refining} onTest={testConsumers} onRefine={refine}/>
    </main>
    <footer className="statusbar">
      <span role={error || campaignError ? 'alert' : 'status'}><AudioLines size={14}/>{error ? errorMessage : campaignError ? campaignMessage : refining ? t('Refining campaign assets', '正在优化推广物料') : statusLabels[flow.status]}</span>
      <span><CircleHelp size={13}/>{t('Phase 1 / Local workspace', '第一阶段 / 本地工作区')}</span>
    </footer>
  </div>;
}
