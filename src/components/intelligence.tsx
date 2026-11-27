import {
  BookOpenCheck,
  Check,
  ChevronDown,
  ExternalLink,
  FlaskConical,
  LoaderCircle,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import type { AiMode, Locale, WorkflowState, ZhihuInsightPack } from '@/domain/types';
import { Empty, formatDimension, PaneHeading, Skeleton, translate } from './common';
import { Button } from './ui/button';

export function Intelligence({
  locale,
  flow,
  aiMode,
  getrunConfigured,
  refining,
  zhihuInsights,
  zhihuLoading,
  zhidaLoading,
  onSelectZhihuQuery,
  onAskZhida,
  onTest,
  onRefine,
}: {
  locale: Locale;
  flow: WorkflowState;
  aiMode: AiMode;
  getrunConfigured: boolean;
  refining: boolean;
  zhihuInsights?: ZhihuInsightPack;
  zhihuLoading: boolean;
  zhidaLoading: boolean;
  onSelectZhihuQuery: (query: string) => void;
  onAskZhida: () => void;
  onTest: () => void;
  onRefine: () => void;
}) {
  const t = translate(locale);
  const risks = 'result' in flow ? flow.result.risks : [];
  const feedback = 'feedback' in flow ? flow.feedback : [];
  const testing = flow.status === 'testing';
  const canTest = flow.status === 'generated' || flow.status === 'feedback-ready' || flow.status === 'refined';
  const canRefine = flow.status === 'feedback-ready';
  const levels = ['High', 'Medium', 'Low'] as const;
  const isLive = aiMode === 'live' && getrunConfigured;

  const fallbackBadgeLabel =
    zhihuInsights?.degradedReason === 'quota'
      ? t('Quota reached · Curated', '今日额度已满 · 精选参考')
      : zhihuInsights?.degradedReason === 'empty'
        ? t('Broadened · Curated', '无精确命中 · 相关参考')
        : zhihuInsights?.degradedReason === 'unconfigured'
          ? t('Curated cases', '精选出海参考')
          : t('Offline · Curated', '接口降级 · 精选参考');

  return (
    <aside className="pane intelligence" aria-label={t('Cultural Intelligence', '跨文化洞察')}>
      <PaneHeading icon={Radar} title={t('Cultural Intelligence', '跨文化洞察')}>
        {t('Market fit, Zhihu seller cases, and audience response', '合规避坑雷达、知乎实战引证与海外客群内测')}
      </PaneHeading>
      <div className="pane-scroll intelligence-scroll">
        <section className="intelligence-module">
          <header className="module-title">
            <div>
              <ShieldCheck size={16} />
              <h3>{t('Cross-cultural Diagnostics', '跨文化风险诊断')}</h3>
            </div>
          </header>
          {flow.status === 'analyzing' ? (
            <Skeleton label={t('Scanning cultural taboos & compliance claims…', '正在扫描文化禁忌、广告法合规与单位规范…')} />
          ) : risks.length ? (
            <>
              <div className="risk-overview">
                {levels.map((level, index) => (
                  <div key={level}>
                    <span className={`risk-level ${level.toLowerCase()}`}>{t(level, ['高危', '注意', '提示'][index])}</span>
                    <b>{risks.filter(r => r.level === level).length}</b>
                  </div>
                ))}
              </div>
              <div className="risk-list">
                {risks.map((risk, i) => (
                  <details className="risk" key={risk.id} open={i === 0 || risk.level === 'High' || undefined}>
                    <summary>
                      <span className={`risk-level ${risk.level.toLowerCase()}`}>
                        {t(risk.level, risk.level === 'High' ? '高危' : risk.level === 'Medium' ? '注意' : '提示')}
                      </span>
                      <strong>{formatDimension(locale, risk.dimension)}</strong>
                      <ChevronDown size={15} />
                    </summary>
                    <div className="risk-body">
                      <dl>
                        <dt>{t('Source element', '命中的原文 / 视觉元素')}</dt>
                        <dd>{risk.original}</dd>
                        <dt>{t('Cross-cultural issue', '跨文化问题解析')}</dt>
                        <dd>{locale === 'zh' ? risk.explanationZh ?? risk.explanation : risk.explanation}</dd>
                        <dt>{t('Recommended adaptation', '本地化修改建议')}</dt>
                        <dd>{locale === 'zh' ? risk.recommendationZh ?? risk.recommendation : risk.recommendation}</dd>
                      </dl>
                    </div>
                  </details>
                ))}
              </div>
              <p className="module-note">
                {t('AI cross-cultural editorial audit. Legal review remains separate.', 'AI 跨文化传播与合规预审建议，正式投放前请结合当地法规复核。')}
              </p>
            </>
          ) : (
            <Empty icon={ShieldCheck} title={t('No diagnostics yet', '暂无跨文化诊断')}>
              {t(
                'Run localization to review claims, cultural taboos, visual fit, and units.',
                '开始本地化后，自动检测宣传合规、肤色/宗教禁忌、视觉审美与度量衡差异。',
              )}
            </Empty>
          )}
        </section>

        <section className="intelligence-module zhihu-module">
          <header className="module-title">
            <div>
              <BookOpenCheck size={16} />
              <h3>{t('Zhihu Seller Cases', '知乎出海实战引证')}</h3>
            </div>
            {zhihuInsights && (
              <span className={`zhihu-badge ${zhihuInsights.source === 'live' ? 'live' : 'fallback'}`}>
                {zhihuLoading && <LoaderCircle size={11} className="spin" />}
                {zhihuInsights.source === 'live'
                  ? t('Zhihu OpenAPI · Live', '知乎开放平台 · 实时')
                  : fallbackBadgeLabel}
              </span>
            )}
          </header>

          {flow.status === 'analyzing' || (zhihuLoading && !zhihuInsights) ? (
            <Skeleton label={t('Searching Zhihu Open Platform for seller posts…', '正在通过知乎开放平台检索出海一线实战贴…')} />
          ) : zhihuInsights ? (
            <>
              <div className="zhihu-queries" role="group" aria-label={t('Zhihu search topics', '知乎检索主题')}>
                {zhihuInsights.suggestedQueries.map(q => (
                  <button
                    key={q}
                    type="button"
                    className="zhihu-query-chip"
                    aria-pressed={q === zhihuInsights.activeQuery}
                    disabled={zhihuLoading}
                    onClick={() => onSelectZhihuQuery(q)}
                  >
                    <Search size={11} />
                    <span>{q}</span>
                  </button>
                ))}
              </div>

              <div className="zhihu-list">
                {zhihuInsights.items.map(item => (
                  <article key={item.id} className="zhihu-card">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="zhihu-card-title">
                      <span>{item.title}</span>
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                    <p className="zhihu-card-excerpt">{item.excerpt}</p>
                    <footer className="zhihu-card-meta">
                      <span className="zhihu-type">
                        {item.contentType === 'Answer' ? t('Answer', '回答') : t('Column', '专栏')}
                      </span>
                      <span className="zhihu-author" title={item.authorBadge || item.author}>
                        {item.author}
                        {item.authorBadge ? ` · ${item.authorBadge}` : ''}
                      </span>
                      {item.voteUpCount > 0 ? (
                        <span className="zhihu-stat">
                          ▲ {item.voteUpCount} {t('upvotes', '赞同')}
                        </span>
                      ) : item.authorityLevel === '3' || item.authorityLevel === '4' ? (
                        <span className="zhihu-stat">{t('Verified insight', '高专度内容')}</span>
                      ) : null}
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="zhihu-open-link">
                        {t('Post ↗', '原帖 ↗')}
                      </a>
                    </footer>
                  </article>
                ))}
              </div>

              {zhihuInsights.zhidaBrief ? (
                <div className="zhida-box">
                  <div className="zhida-head">
                    <span>
                      <Sparkles size={13} />
                      <strong>{t('Zhihu Zhida · Actionable Playbook', '知乎直答 · 实操避坑提炼')}</strong>
                    </span>
                    <small>
                      {zhihuInsights.zhidaSource === 'live' ? 'zhida-fast-1p5' : t('Fallback', '离线参考')}
                    </small>
                  </div>
                  <p className="zhida-text">{zhihuInsights.zhidaBrief}</p>
                  {zhihuInsights.zhidaLocale && zhihuInsights.zhidaLocale !== locale && (
                    <button
                      type="button"
                      className="skip-link zhida-refresh"
                      disabled={zhidaLoading}
                      onClick={onAskZhida}
                    >
                      {zhidaLoading ? <LoaderCircle size={12} className="spin" /> : <Sparkles size={12} />}
                      {t('Refresh summary in English', '切换为中文避坑总结')}
                    </button>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="zhida-trigger"
                  disabled={zhidaLoading}
                  onClick={onAskZhida}
                >
                  {zhidaLoading ? <LoaderCircle size={14} className="spin" /> : <Sparkles size={14} />}
                  {zhidaLoading
                    ? t('Synthesizing via Zhihu Zhida…', '正在调用知乎直答提炼…')
                    : t('Summarize 3 Takeaways via Zhihu Zhida', '调用「知乎直答」提炼 3 条避坑对策')}
                </Button>
              )}
            </>
          ) : (
            <Empty icon={BookOpenCheck} title={t('Zhihu seller cases standby', '等待匹配知乎出海实战案例')}>
              {t(
                'Diagnose a brief to pull real Zhihu cross-border seller discussions & compliance takeaways.',
                '启动本地化或加载案例后，自动检索知乎跨境一线答主的真实踩坑贴与原帖引证。',
              )}
            </Empty>
          )}
        </section>

        <section className="intelligence-module focus-group">
          <header className="module-title">
            <div>
              <UsersRound size={16} />
              <h3>{t('Virtual Focus Group', '海外虚拟焦点小组')}</h3>
            </div>
          </header>
          <p className="focus-label">
            <FlaskConical size={13} />
            {isLive
              ? t('GetRun live persona simulation', 'GetRun 实时海外消费者模拟内测')
              : t('Simulated local consumer personas', '目标市场典型消费者画像反馈')}
          </p>

          <div className="focus-actions">
            <Button disabled={!canTest || testing || refining} onClick={onTest}>
              {testing ? <LoaderCircle size={15} className="spin" /> : <FlaskConical size={15} />}{' '}
              {testing
                ? t('Interviewing local personas…', '正在征集海外客群反馈…')
                : feedback.length
                  ? t('Re-run Virtual Test', '重新运行客群测试')
                  : t('Run Virtual Test', '运行虚拟客群测试')}
            </Button>
            <Button disabled={!canRefine || refining} onClick={onRefine} variant={canRefine ? 'default' : 'outline'}>
              {refining ? (
                <LoaderCircle size={15} className="spin" />
              ) : flow.status === 'refined' ? (
                <Check size={15} />
              ) : (
                <Sparkles size={15} />
              )}{' '}
              {refining
                ? t('Refining into Version 2…', '正在结合槽点精修版本 2…')
                : flow.status === 'refined'
                  ? t('Version 2 created', '已生成精修版本 2')
                  : t('Refine with Feedback', '采纳反馈一键优化')}
            </Button>
          </div>

          {!feedback.length &&
            (testing ? (
              <Skeleton label={t('Generating 3 local consumer perspectives…', '正在生成 3 位当地目标消费者的真实看后感…')} />
            ) : (
              <Empty icon={UsersRound} title={t('Hear from three local perspectives', '听听三位海外本土消费者的真实锐评')}>
                {t(
                  'Generate campaign copy to test how overseas buyers react before spending ad budget.',
                  '生成推广物料后，模拟当地消费者刷到广告的第一反应、槽点与信任顾虑。',
                )}
              </Empty>
            ))}

          <div className="feedback-list" aria-live="polite">
            {feedback.map(item => (
              <article key={item.persona.id} className="feedback">
                <header>
                  <span className="avatar" aria-hidden="true">
                    {item.persona.initials}
                  </span>
                  <div>
                    <strong>{item.persona.name}</strong>
                    <p>{locale === 'zh' ? item.persona.profileZh ?? item.persona.profile : item.persona.profile}</p>
                  </div>
                </header>
                <blockquote>“{item.comment}”</blockquote>
                {locale === 'zh' && item.commentZh && <p className="feedback-zh">参考译文：{item.commentZh}</p>}
                <dl>
                  <dt>{t('Purchase interest', '购买意向')}</dt>
                  <dd>{locale === 'zh' ? item.purchaseInterestZh ?? item.purchaseInterest : item.purchaseInterest}</dd>
                  <dt>{t('Message clarity', '表达清晰度')}</dt>
                  <dd>{locale === 'zh' ? item.messageClarityZh ?? item.messageClarity : item.messageClarity}</dd>
                  <dt>{t('Trust concerns', '核心顾虑/槽点')}</dt>
                  <dd>{locale === 'zh' ? item.trustConcernsZh ?? item.trustConcerns : item.trustConcerns}</dd>
                </dl>
              </article>
            ))}
          </div>

          {testing && !!feedback.length && (
            <p className="test-progress" role="status">
              <LoaderCircle size={14} className="spin" />
              {feedback.length} / 3 {t('responses', '条反馈')}
            </p>
          )}
        </section>
      </div>
    </aside>
  );
}
