# GlobalVibe

GlobalVibe 是面向出海品牌和跨境营销团队的本地化工作台。它把商品简报、目标市场和分发渠道串接到卖点重构、渠道物料、文化诊断和反馈优化。

**当前进度：前端工作台与端到端模拟流程，支持本机中英翻译。**

## 本地运行

需要 Node.js 20.9 或更高版本，以及 npm。在本目录执行：

```sh
npm ci
npm run dev
```

浏览器打开 `http://localhost:3000`。点击 **Load Demo**、**Start Localization**、**Run Virtual Test** 和 **Refine with Feedback** 体验完整流程。中栏可切换版本和五种渠道，Instagram 和 Website 支持视觉预览。

```sh
npm run typecheck
npm run lint
npm run build
npm start
```

## 技术栈与目录

- Next.js App Router、React、TypeScript、Tailwind CSS 4、shadcn/ui 风格的项目本地 Button 和 Lucide。
- `src/app/` 提供入口、元数据和全局视觉样式。
- `src/components/` 提供 Studio 编排、三栏组件、预览和基础控件。
- `src/domain/types.ts` 定义数据模型，`mock-data.ts` 提供演示资料，`services.ts` 提供服务契约与应用入口，`mock-services.ts` 提供模拟实现。
- `public/demo-power-bank.webp` 是演示商品示意图，只有加载演示时使用。

## 本机中英翻译

在商品描述中粘贴自己的中文文案，按句号、分号或换行分隔卖点，然后点击 **Start Localization**。中栏 **Literal Translation** 显示每条卖点的英文机器译文。英文输入沿用原文。首次翻译会下载公开的 OPUS 中英模型到 `.model-cache/`，缓存完成后可离线推理。页面打开和预设演示可以直接使用，全程无需 API Key。文案只发往本机 Next.js 服务，推理在本机执行。

## 可选的 GetRun 营销文案

在根目录 `.env.local` 中填写 `GETRUN_API_KEY` 和 `GETRUN_MODEL`，后者使用密钥有权限访问且支持 Chat Completions 的模型 ID。已有配置会保留。`GETRUN_BASE_URL` 默认指向 `https://api.get-apikey.com/v1`。保存后重启应用。

启用后，卖点原文、英文译文、市场、受众和渠道发送给 GetRun，以生成本地化改写和五个平台的营销文案。V2 同时发送模拟反馈和上一版卖点。直译始终在本机完成，图片留在浏览器。Key 留空时，文案使用示例数据；GetRun 出错时，页面保留本机译文并显示提示。

## 当前边界

预设演示的原文与直译为预写内容。商品分析、诊断和消费者反馈使用模拟服务。图片上传和预览、表单操作、资产预览与复制都在浏览器内执行，视觉预览使用原图。页面刷新会清空工作状态，导出入口标为不可用。语言切换覆盖界面控件与状态文案，生成的营销内容仍是英文示例。详见 [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)。
