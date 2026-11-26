import { Check, ChevronDown, FlaskConical, LoaderCircle, Radar, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import type { Locale, WorkflowState } from '@/domain/types';
import { Empty, PaneHeading, Skeleton, translate } from './common';
import { Button } from './ui/button';

export function Intelligence({ locale, flow, refining, onTest, onRefine }: {
  locale: Locale;
  flow: WorkflowState;
  refining: boolean;
  onTest: () => void;
  onRefine: () => void;
}) {
  const t = translate(locale);
  const risks = 'result' in flow ? flow.result.risks : [];
  const feedback = 'feedback' in flow ? flow.feedback : [];
  const testing = flow.status === 'testing';
  const generated = flow.status === 'generated';
  const canRefine = flow.status === 'feedback-ready';
  const levels = ['High', 'Medium', 'Low'] as const;
  return <aside className="pane intelligence" aria-label={t('Cultural Intelligence', '文化洞察')}>
    <PaneHeading icon={Radar} title={t('Cultural Intelligence', '文化洞察')}>{t('Market fit, risk, and audience response', '市场适配、风险与受众反馈')}</PaneHeading>
    <div className="pane-scroll intelligence-scroll">
      <section className="intelligence-module">
        <header className="module-title"><div><ShieldCheck size={16}/><h3>{t('Cross-cultural Diagnostics', '跨文化诊断')}</h3></div></header>
        {flow.status === 'analyzing' ? <Skeleton label={t('Reviewing cultural fit…', '正在检查文化适配…')}/> : risks.length ? <>
          <div className="risk-overview">{levels.map((level, index) => <div key={level}><span className={`risk-level ${level.toLowerCase()}`}>{t(level, ['高', '中', '低'][index])}</span><b>{risks.filter(r => r.level === level).length}</b></div>)}</div>
          <div className="risk-list">{risks.map((risk, i) => <details className="risk" key={risk.id} open={i === 0 || undefined}>
            <summary><span className={`risk-level ${risk.level.toLowerCase()}`}>{t(risk.level, risk.level === 'High' ? '高' : risk.level === 'Medium' ? '中' : '低')}</span><strong>{risk.dimension}</strong><ChevronDown size={15}/></summary>
            <div className="risk-body"><dl><dt>{t('Original content', '原始内容')}</dt><dd>{risk.original}</dd><dt>{t('Explanation', '说明')}</dt><dd>{risk.explanation}</dd><dt>{t('Recommended adaptation', '调整建议')}</dt><dd>{risk.recommendation}</dd></dl></div>
          </details>)}</div>
          <p className="module-note">{t('Simulated editorial checks. Legal review remains separate.', '模拟编辑检查，法律审核应单独进行。')}</p>
        </> : <Empty icon={ShieldCheck} title={t('No diagnostics yet', '暂无诊断结果')}>{t('Run localization to review claims, language, visual fit, and units.', '开始本地化，查看宣传声明、语言、视觉和单位建议。')}</Empty>}
      </section>
      <section className="intelligence-module focus-group">
        <header className="module-title"><div><UsersRound size={16}/><h3>{t('Virtual Focus Group', '虚拟焦点小组')}</h3></div></header>
        <p className="focus-label"><FlaskConical size={13}/>{t('AI-simulated feedback', 'AI 模拟反馈')}</p>

        <div className="focus-actions">
          <Button disabled={!generated} onClick={onTest}>{testing ? <LoaderCircle size={15} className="spin"/> : <FlaskConical size={15}/>} {testing ? t('Running virtual test…', '正在模拟测试…') : t('Run Virtual Test', '运行虚拟测试')}</Button>
          <Button disabled={!canRefine || refining} onClick={onRefine} variant={canRefine ? 'default' : 'outline'}>{refining ? <LoaderCircle size={15} className="spin"/> : flow.status === 'refined' ? <Check size={15}/> : <Sparkles size={15}/>} {refining ? t('Refining…', '正在优化…') : flow.status === 'refined' ? t('Version 2 created', '已生成版本 2') : t('Refine with Feedback', '根据反馈优化')}</Button>
        </div>
        {!feedback.length && (testing ? <Skeleton label={t('Waiting for the first response…', '正在等待第一条反馈…')}/> : <Empty icon={UsersRound} title={t('Hear from three perspectives', '了解三类受众的看法')}>{t('Generate campaign copy to start a simulated audience test.', '生成推广文案后即可开始模拟受众测试。')}</Empty>)}
        <div className="feedback-list" aria-live="polite">{feedback.map(item => <article key={item.persona.id} className="feedback">
          <header><span className="avatar" aria-hidden="true">{item.persona.initials}</span><div><strong>{item.persona.name}</strong><p>{item.persona.profile}</p></div></header>
          <blockquote>“{item.comment}”</blockquote>
          <dl><dt>{t('Purchase interest', '购买意向')}</dt><dd>{item.purchaseInterest}</dd><dt>{t('Message clarity', '文案清晰度')}</dt><dd>{item.messageClarity}</dd><dt>{t('Trust concerns', '信任顾虑')}</dt><dd>{item.trustConcerns}</dd></dl>
        </article>)}</div>
        {testing && !!feedback.length && <p className="test-progress" role="status"><LoaderCircle size={14} className="spin"/>{feedback.length} / 3 {t('responses', '条反馈')}</p>}

      </section>
    </div>
  </aside>;
}
