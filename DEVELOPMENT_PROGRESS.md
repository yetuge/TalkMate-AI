# TalkMate AI 开发进度文档

## 项目概览

TalkMate AI 是一个 Web 端 AI 英语口语陪练 MVP。目标用户流程如下：

```text
场景选择 -> 语音/文本输入 -> AI 英语对话 -> 即时纠错 -> 课后报告 -> 历史记录
```

项目计划使用的技术栈：

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Supabase
- OpenAI API

## 当前状态

当前阶段：**Step 2 已完成**

项目已经初始化为一个最小可运行的 Next.js 应用，并完成基础场景数据和主要页面路由占位。完整页面 UI 和业务功能尚未开始。

## 已完成工作

### Step 1：初始化项目结构和依赖

状态：**已完成**

已完成内容：

- 创建 Next.js App Router 项目骨架。
- 添加 TypeScript 配置。
- 添加 TailwindCSS 和 PostCSS 配置。
- 添加 shadcn/ui 配置文件。
- 添加全局样式和基础 CSS 变量。
- 添加临时首页占位页面。
- 添加环境变量示例文件。
- 创建后续开发需要的基础目录，包括 `components`、`hooks`、`lib`、`supabase`。
- 安装核心依赖。

### Step 2：实现场景数据和页面路由

状态：**已完成**

已完成内容：

- 在 `lib/types.ts` 中添加场景、消息、评分、纠错、报告和练习会话等共享类型。
- 在 `lib/scenarios.ts` 中维护四个固定练习场景：
  - Job Interview
  - Restaurant Ordering
  - Business Meeting
  - Travel
- 添加 `/scenarios` 页面路由占位，并从共享场景数据渲染场景列表。
- 添加 `/practice` 页面路由占位，并读取 `scenario` 查询参数。
- 添加 `/history` 页面路由占位。
- 添加 `/report/[sessionId]` 动态报告页面路由占位。

主要新增文件：

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  ui/
hooks/
lib/
  utils.ts
supabase/
.env.example
.gitignore
components.json
next.config.ts
package.json
package-lock.json
postcss.config.mjs
tailwind.config.ts
tsconfig.json
README.md
lib/types.ts
lib/scenarios.ts
app/scenarios/page.tsx
app/practice/page.tsx
app/history/page.tsx
app/report/[sessionId]/page.tsx
```

## 验证记录

以下命令已通过：

```bash
npm.cmd run typecheck
npm.cmd run build
```

验证结果：

- Next.js 编译成功。
- TypeScript 类型检查通过。
- 静态页面生成通过。

开发服务器验证命令：

```bash
npm.cmd run dev -- -p 3000
```

本地访问地址：

```text
http://localhost:3000
```

Step 2 路由验证地址：

```text
http://localhost:3000/scenarios
http://localhost:3000/practice?scenario=job-interview
http://localhost:3000/history
http://localhost:3000/report/demo-session
```

说明：当前受限环境中，开发服务器无法作为隐藏后台进程稳定保活，但前台启动已验证成功。

## 计划中的项目结构

MVP 目标结构如下：

```text
app/
  page.tsx
  scenarios/page.tsx
  practice/page.tsx
  report/[sessionId]/page.tsx
  history/page.tsx
  api/chat/route.ts
  api/correction/route.ts
  api/report/route.ts
  api/sessions/route.ts
components/
  ScenarioCard.tsx
  ChatMessage.tsx
  VoiceRecorder.tsx
  FeedbackPanel.tsx
  ScoreCard.tsx
  ReportCard.tsx
  HistoryItem.tsx
  LoadingDots.tsx
  ui/
hooks/
  useSpeechRecognition.ts
  useSpeechSynthesis.ts
  usePracticeSession.ts
lib/
  openai.ts
  supabase.ts
  prompts.ts
  scenarios.ts
  types.ts
supabase/
  schema.sql
```

## 开发路线

### Step 1：初始化项目结构和依赖

状态：**已完成**

目标：

- 让项目可以安装依赖、通过类型检查，并成功构建。

### Step 2：实现场景数据和页面路由

状态：**已完成**

目标：

- 在 `lib/scenarios.ts` 中维护统一的场景数据。
- 在 `lib/types.ts` 中添加共享 TypeScript 类型。
- 创建 `/scenarios`、`/practice`、`/history`、`/report/[sessionId]` 路由占位页面。

### Step 3：实现首页和场景选择页

状态：**未开始**

目标：

- 完成第一个可用入口流程。
- 用户可以从 `/` 进入 `/scenarios`。
- 用户可以选择四个指定口语练习场景之一。

### Step 4：实现练习页基础 UI

状态：**未开始**

目标：

- 创建聊天区域、右侧反馈区域和底部输入控制区。
- 在接入真实 AI 与语音功能前，先保证页面结构可用。

### Step 5：实现 Web Speech API 语音识别 Hook

状态：**未开始**

目标：

- 支持浏览器语音识别。
- 浏览器不支持时提供手动文本输入兜底。

### Step 6：实现 AI 对话 API

状态：**未开始**

目标：

- 实现 `POST /api/chat`。
- 根据练习场景生成简短、自然、只使用英文的 AI 回复。

### Step 7：实现即时纠错 API

状态：**未开始**

目标：

- 实现 `POST /api/correction`。
- 返回严格 JSON，包括原句、修改后句子、错误原因、更自然表达和各项评分。

### Step 8：实现课后报告 API

状态：**未开始**

目标：

- 实现 `POST /api/report`。
- 根据完整对话和纠错记录生成本次练习报告 JSON。

### Step 9：实现 Supabase 历史记录保存

状态：**未开始**

目标：

- 添加数据库表结构。
- 保存练习会话、聊天消息和纠错记录。
- 如果 Supabase 暂未配置，保留 localStorage 兜底方案。

### Step 10：实现历史记录页和报告页

状态：**未开始**

目标：

- 展示历史练习记录。
- 展示指定练习会话的详细报告。

### Step 11：优化 UI、Loading、错误处理和空状态

状态：**未开始**

目标：

- 提升交互体验。
- 补齐加载状态、空状态和错误提示。
- 为最终 Demo 录制做准备。

## 建议提交计划

为了满足比赛要求中的持续开发记录，建议每个 Step 单独提交，并尽量对应单独 PR。

建议第一个 commit：

```text
feat: initialize TalkMate AI project
```

建议第二个 commit：

```text
feat: add scenario data and routes
```

建议第一个 PR 描述：

```text
## 功能说明

初始化 TalkMate AI Next.js 项目。

## 实现思路

- 添加 Next.js App Router 项目骨架。
- 添加 TypeScript 和 TailwindCSS 配置。
- 添加 shadcn/ui 配置。
- 创建 components、hooks、lib、supabase 等基础目录。
- 添加临时首页占位页面。

## 验证方式

- npm.cmd run typecheck
- npm.cmd run build
```

## 下一步

开始 **Step 3：实现首页和场景选择页**。
