# GlobalVibe 项目上下文

## 产品设计

GlobalVibe 服务于中国出海品牌、跨境电商和海外营销团队。核心价值主张是 “Don't just translate your product. Translate why it matters.” Studio 以左栏录入、中栏创作、右栏诊断与验证承载一条连续链路。桌面工作区采用独立滚动的三栏，小屏按顺序重排。界面默认为英文，并支持切换中文界面文案。

## 数据与服务

- `ProductInput` 保存原始描述与图片引用，`ProductProfile` 保存商品名称、提取属性与来源。
- `MarketProfile` 和 `AudienceProfile` 定义目标市场和受众。它们与所选渠道组成 `LocalizationConfig`。
- `SellingPoint` 保存原文、直译、本地化表达、重点词和改写依据。 `CulturalRisk` 保存维度、等级、原文、解释与建议。
- `PlatformAsset` 保存平台对应的字段列表，Instagram 和 Website 另带视觉文案。真实浏览器组件使用原图进行 HTML/CSS 排版。
- `ConsumerPersona` 和 `ConsumerFeedback` 表达受众画像与逐条反馈。 `ContentVersion` 保存卖点、资产和调整摘要。
- `WorkflowState` 以可辨识联合类型描述当前阶段与可用产物。

`LocalizationServices` 约定六个方法，签名与适配器选择在 `src/domain/services.ts`。

| 接口 | Phase 2 接入点 |
| --- | --- |
| `analyzeProduct(input)` | 多模态理解与商品事实提取 |
| `diagnoseCulture(input, profile, config)` | 市场语境与编辑风险检查 |
| `localizeSellingPoints(input, profile, config)` | 基于原文和商品事实重构卖点 |
| `generatePlatformAssets(profile, points, config)` | 生成各平台结构化内容 |
| `simulateConsumers(profile, version, config)` | 按消费者逐条返回异步反馈 |
| `refineContent(profile, version, feedback, config)` | 生成版本 2 与调整摘要 |

## 状态与关键决策

`empty → ready → analyzing → generated → testing → feedback-ready → refined`。顶栏显示 Input、Diagnose、Create、Validate。Studio 统一维护阶段和结果，三栏组件读取同一份状态。编辑输入或重置会使旧操作失效，避免结果跨简报回填。浏览器用对象 URL 显示上传原图，替换和移除时释放旧 URL。真实的图片内容解析将在服务接入后完成。

默认演示使用指定的 10,000 mAh 商品资料，卖点重构保留明确容量，避免验证不足的充电功率、认证、实际销量和续航保证。自定义中文简报通过本机 `POST /api/translate` 使用 OPUS 翻译到英文，直译栏读取模型输出，本地化与推广默认展示通用样例。启用 GetRun 后，服务端 `POST /api/campaign` 使用环境变量持有密钥，生成本地化与渠道文案，保留本机直译与卖点 ID。模型权重在首用时下载并缓存，用户文案在本机执行推理。所有五个渠道均可预览，未选择的渠道标为参考样例。诊断是编辑建议，虚拟客群是模拟反馈，导出明确不可用。

## Phase 2 接续

待 Phase 1 验收后，保留现有 UI 与数据契约，新增服务实现与服务端密钥边界。真实链路需要为上传文件建立传输协议，并处理响应校验、取消、超时、可重试错误及异步反馈流。输出应注明事实来源，保留原图和两个可比较的内容版本。真实服务、导出和持久化按后续阶段需求排期。
