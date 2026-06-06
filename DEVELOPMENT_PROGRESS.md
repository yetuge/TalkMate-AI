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
- DeepSeek API

## 当前状态

当前阶段：**Step 19 开发中**

项目已经初始化为一个最小可运行的 Next.js 应用，完成基础场景数据、主要页面路由占位、首页与场景选择页、练习页基础 UI、浏览器语音识别 Hook、AI 对话 API、即时纠错 API、课后报告 API、Supabase 历史记录保存、历史记录页和报告详情读取，并优化 UI 状态展示、AI 回复流式输出、中文界面文案、流式渲染节奏、长对话布局、AI 回复语音播放、聊天区条件跟随滚动和语音播放错误提示体验。当前正在优化实时纠错质量，让反馈更符合口语练习场景。

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

### Step 3：实现首页和场景选择页

状态：**已完成**

已完成内容：

- 将首页从初始化占位页升级为正式产品入口。
- 首页展示产品名 `TalkMate AI`。
- 首页展示 Slogan：`Practice Real English Conversations with AI`。
- 首页添加 `Start Practice` 按钮，点击进入 `/scenarios`。
- 首页展示五个核心功能：
  - Scenario Speaking Practice
  - AI Real-Time Conversation
  - Grammar Correction
  - Session Summary
  - Growth Tracking
- 新增 `components/ScenarioCard.tsx` 场景卡片组件。
- `/scenarios` 页面展示四个指定练习场景卡片。
- 点击场景卡片可进入 `/practice?scenario=...`。

### Step 4：实现练习页基础 UI

状态：**已完成**

已完成内容：

- 将 `/practice` 页面从路由占位升级为基础练习界面。
- 新增 `components/PracticeRoom.tsx` 客户端练习房间组件。
- 新增 `components/ChatMessage.tsx` 聊天气泡组件。
- 新增 `components/FeedbackPanel.tsx` 即时反馈面板组件。
- 新增 `components/VoiceRecorder.tsx` 底部输入控制组件。
- 新增 `components/LoadingDots.tsx` 加载状态组件。
- 练习页支持根据 `scenario` 查询参数加载对应场景。
- 练习页包含桌面端聊天区和反馈区布局，移动端自动上下排列。
- 底部控制区包含开始录音、停止录音、当前识别文本、发送、结束练习按钮。
- 目前发送消息使用本地 UI 模拟反馈和 AI 回复，真实语音识别与 AI API 将在后续步骤接入。

### Step 5：实现 Web Speech API 语音识别 Hook

状态：**已完成**

已完成内容：

- 新增 `hooks/useSpeechRecognition.ts`。
- 新增 `lib/speech-recognition.d.ts`，为浏览器 SpeechRecognition API 添加 TypeScript 声明。
- 支持 Chrome/Edge 常用的 `webkitSpeechRecognition`。
- 支持开始录音和停止录音。
- 支持实时显示识别中的文本。
- 用户可以手动编辑识别文本。
- 点击发送后会清空当前文本。
- 浏览器不支持 Web Speech API 时显示提示：
  - 当前浏览器不支持语音识别，请手动输入文本。
- 麦克风权限拒绝、未检测到麦克风、无语音输入、网络错误等场景会显示可读错误提示。

### Step 6：实现 AI 对话 API

状态：**已完成**

已完成内容：

- 新增 `lib/ai.ts`，封装 DeepSeek API 客户端配置。
- 新增 `lib/prompts.ts`，维护场景化英文对话 Prompt。
- 新增 `app/api/chat/route.ts`。
- `/api/chat` 支持接收当前场景和聊天消息。
- AI 回复要求：
  - 只使用英文。
  - 每次回复 1 到 3 句话。
  - 根据当前场景扮演对应角色。
  - 推动用户继续口语表达。
- 练习页发送消息后会调用 `/api/chat` 获取 AI 回复。
- 未配置 `DEEPSEEK_API_KEY` 或接口调用失败时，会返回场景化兜底回复，保证演示流程可继续。
- `.env.example` 新增 DeepSeek 相关环境变量：
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_BASE_URL`
  - `DEEPSEEK_MODEL`

### Step 7：实现即时纠错 API

状态：**已完成**

已完成内容：

- 新增 `app/api/correction/route.ts`。
- 扩展 `lib/prompts.ts`，新增纠错 Prompt。
- `/api/correction` 支持接收用户句子和当前练习场景。
- 返回结构包含：
  - 原句 `original`
  - 修改后句子 `corrected`
  - 错误原因 `reason`
  - 更自然表达 `betterExpression`
  - 本轮评分 `scores`
- 评分包含：
  - grammar
  - fluency
  - vocabulary
  - pronunciation
- 练习页发送消息后，会并行调用 `/api/chat` 和 `/api/correction`。
- 右侧即时反馈面板展示真实纠错 API 返回结果。
- 未配置 `DEEPSEEK_API_KEY` 或接口调用失败时，会返回 fallback 纠错结果，保证演示流程可继续。
- `prompt.md` 中技术栈从 `OpenAI API` 调整为 `DeepSeek API（OpenAI-compatible）`。

### Step 8：实现课后报告 API

状态：**已完成**

已完成内容：

- 新增 `app/api/report/route.ts`。
- 扩展 `lib/prompts.ts`，新增课后报告 Prompt。
- 新增 `lib/json.ts`，复用模型 JSON 解析逻辑。
- 新增 `components/ReportView.tsx`。
- `/api/report` 支持接收当前场景、完整对话消息、所有纠错记录和练习时长。
- 报告返回总分、四项评分、高频错误、改进建议、推荐练习句、推荐口语任务和中文总结。
- 点击练习页 `End` 后会调用 `/api/report`。
- 报告结果暂存 localStorage，并跳转 `/report/[sessionId]` 展示。
- 未配置 `DEEPSEEK_API_KEY` 或接口调用失败时，会返回 fallback 报告，保证演示流程可继续。

### Step 9：实现 Supabase 历史记录保存

状态：**已完成**

已完成内容：

- 基于 `feat/step-9-supabase-history` 分支开发，准备通过 PR 合并。
- 新增 `lib/supabase.ts`。
- 新增 `supabase/schema.sql`。
- 新增 `app/api/sessions/route.ts`。
- `POST /api/sessions` 支持保存练习会话、聊天消息和纠错记录。
- `GET /api/sessions` 支持按时间倒序获取历史会话摘要。
- 练习页生成报告后会调用 `/api/sessions` 保存结果。
- Supabase 未配置时，保存接口返回 `provider: "localStorage"`，主流程继续使用 localStorage 兜底。

### Step 10：实现历史记录页和报告页

状态：**已完成**

已完成内容：

- 新增 `components/HistoryView.tsx`。
- 新增 `components/HistoryItem.tsx`。
- `/history` 页面从占位页升级为历史记录列表。
- 历史页优先读取 `/api/sessions` 返回的 Supabase 记录。
- Supabase 未配置或本地演示时，历史页读取 localStorage 中的报告记录。
- 历史记录按结束时间倒序展示。
- 每条历史记录展示场景、日期、练习时长、总分和报告入口。
- 扩展 `GET /api/sessions?id=...`，支持读取指定会话详情。
- `/report/[sessionId]` 在 localStorage 找不到报告时，会尝试从 Supabase 读取报告详情。

### Step 11：优化 UI、Loading、错误处理和空状态

状态：**已完成**

已完成内容：

- 新增 `components/StatusNotice.tsx`，统一页面状态提示样式。
- 练习页发送消息时，右侧反馈区显示分析中状态。
- 练习页生成报告时，底部显示报告准备状态。
- 练习页 API fallback 或失败时显示可读提示，不再使用浏览器 alert。
- 语音识别错误和不支持提示统一为状态提示组件。
- 历史页加载状态、localStorage fallback 状态和空状态展示更清晰。
- 报告页加载状态和未找到状态展示更清晰。

### Step 12：实现 SSE 流式 AI 回复

状态：**已完成**

已完成内容：

- 新增 `app/api/chat/stream/route.ts`。
- 新增 `lib/chat.ts`，复用聊天消息校验、场景化 fallback 回复和 AI 消息构建逻辑。
- `/api/chat/stream` 使用 `text/event-stream` 返回 token、done 和 error 事件。
- 配置 DeepSeek API 时，服务端通过 OpenAI-compatible streaming 接收模型增量输出。
- 未配置 DeepSeek API 或流式请求失败时，接口会输出场景化 fallback 回复，保证演示流程不中断。
- 练习页发送消息后会立即创建一条 TalkMate AI 回复气泡，并随着 SSE token 到达逐步填充内容。
- 即时纠错请求继续与 AI 流式回复并行执行。
- 空的 AI 回复气泡会显示 loading dots，避免等待期间页面无反馈。

### Step 13：中文化主要界面文案

状态：**已完成**

已完成内容：

- 新增 `lib/labels.ts`，集中维护场景中文名、难度标签、AI 角色、目标说明和评分标签。
- 首页、场景选择页、练习页、历史页、报告页的主要按钮、标题、说明和状态提示改为中文。
- 即时反馈面板中的栏目名改为中文，包括原句、修改后、原因、更自然表达和评分项。
- 练习页保留英文对话内容、AI 英文回复和英文输入提示方向，避免影响口语练习目标。
- 历史记录和报告页使用中文场景名展示旧记录和 Supabase 记录。
- 纠错 Prompt 调整为中文解释错误原因，报告 Prompt 调整为中文输出常见问题、建议和口语任务。
- 本地 fallback 纠错和报告内容同步中文化，未配置 AI 服务时仍便于演示。

### Step 14：优化 SSE 流式回复的前端双缓冲渲染

状态：**已完成**

已完成内容：

- 在练习页 SSE 读取逻辑中明确区分 `sseBuffer` 和 `renderBuffer`。
- `sseBuffer` 负责拼接网络 chunk，确保只解析完整的 SSE 消息。
- SSE token 解析完成后写入 `renderBuffer`，不再每个 token 都立即触发 React 状态更新。
- 使用固定间隔 timer 批量 flush 缓冲内容到同一条 AI 回复气泡。
- SSE 流结束或读取退出时强制 flush 剩余内容，避免最后一段回复丢失。
- 为 DeepSeek 流式连接增加默认 15 秒超时，网络异常时快速进入 fallback 流式回复。
- 保持 `/api/chat/stream` 后端接口不变，只优化前端网络读取和 UI 渲染节奏。

### Step 15：优化练习页长对话布局

状态：**已完成**

已完成内容：

- 练习页桌面端使用固定视口高度布局，避免长对话撑开整页。
- 顶部场景栏设置为 sticky，滚动时仍能看到返回入口、当前场景和 AI 角色。
- 聊天消息区改为内部滚动，长对话时只滚动消息列表。
- 底部输入控制区固定在练习卡片底部，发送和结束按钮保持可见。
- 右侧即时反馈面板在桌面端 sticky，并限制最大高度，内容过长时面板内部滚动。

### Step 16：实现 AI 回复语音播放

状态：**已完成**

已完成内容：

- 新增 `hooks/useSpeechSynthesis.ts`，封装浏览器 SpeechSynthesis 播放能力。
- AI 回复生成完成后自动朗读英文回复。
- 新一轮发送消息、开始录音或结束练习时，会停止当前 AI 朗读。
- 朗读状态继续复用练习页中的 `AI 正在朗读` 提示。
- 浏览器不支持 SpeechSynthesis 或播放失败时，页面显示中文提示，文字练习流程不受影响。

### Step 17：实现聊天区条件跟随滚动

状态：**已完成**

已完成内容：

- 为练习页聊天消息区新增滚动容器引用。
- 根据用户当前位置判断是否接近消息底部。
- 当用户位于底部附近时，新消息和 SSE 流式回复会自动滚动到底部。
- 当用户手动向上查看历史消息时，自动跟随暂停，避免页面强制跳回底部。
- 用户发送新一轮消息时重新开启跟随，让当前对话自然回到底部。

### Step 18：修复语音播放提示和稳定性

状态：**已完成**

已完成内容：

- `StatusNotice` 新增可选关闭按钮。
- 语音播放失败提示支持手动关闭，不再一直占用输入区上方空间。
- `useSpeechSynthesis` 增强播放状态管理，避免旧 utterance 的结束或错误事件影响当前播放状态。
- 播放前清理 pending speak timer，并延迟短时间执行 `speechSynthesis.speak`，降低 cancel 后立即播放导致的中断概率。
- 监听浏览器 `voiceschanged`，在语音列表加载后更稳定地选择英文语音。

### Step 19：优化实时纠错的口语反馈质量

状态：**开发中**

已完成内容：

- 优化即时纠错 Prompt，明确按口语练习而不是书面作文批改。
- 要求 AI 忽略大小写、标点、逗号空格和句号缺失等纯书面格式问题。
- 要求短回答不强行判错，而是扩展成完整自然的口语表达。
- 练习页调用 `/api/correction` 时传入上一轮 AI 提问，纠错可以结合上下文判断回答是否贴题。
- 纠错 Prompt 增加 yes/no 问题和二选一问题的判断规则。
- 后端解析纠错结果时识别“只改大小写或标点”的情况，避免把这类格式差异作为主要反馈。
- 优化 fallback 纠错内容，默认强调口语表达完整度，不再补充基础标点作为纠错理由。

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
components/ScenarioCard.tsx
components/PracticeRoom.tsx
components/ChatMessage.tsx
components/FeedbackPanel.tsx
components/VoiceRecorder.tsx
components/LoadingDots.tsx
hooks/useSpeechRecognition.ts
hooks/useSpeechSynthesis.ts
lib/speech-recognition.d.ts
lib/ai.ts
lib/prompts.ts
app/api/chat/route.ts
app/api/chat/stream/route.ts
app/api/correction/route.ts
app/api/report/route.ts
lib/json.ts
lib/chat.ts
lib/labels.ts
components/ReportView.tsx
lib/supabase.ts
supabase/schema.sql
app/api/sessions/route.ts
components/HistoryView.tsx
components/HistoryItem.tsx
components/StatusNotice.tsx
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

Step 3 页面验证重点：

```text
http://localhost:3000
http://localhost:3000/scenarios
```

需要确认：

- 首页产品名、Slogan、开始按钮和功能介绍正常展示。
- 点击 `Start Practice` 能进入 `/scenarios`。
- `/scenarios` 显示四个场景卡片。
- 点击任意场景卡片能进入对应 `/practice?scenario=...` 页面。

Step 4 页面验证重点：

```text
http://localhost:3000/practice?scenario=job-interview
```

需要确认：

- 页面左侧/上方显示聊天区域。
- 页面右侧/下方显示即时反馈区域。
- 底部显示录音、文本输入、发送和结束练习控制。
- 输入英文句子并点击 `Send` 后，聊天区会新增用户消息、模拟 AI 回复和反馈内容。

Step 5 页面验证重点：

```text
http://localhost:3000/practice?scenario=job-interview
```

需要确认：

- 点击录音按钮后，浏览器请求麦克风权限。
- 说英文时，文本框实时显示识别结果。
- 点击停止按钮后，语音识别结束。
- 文本框内容可以手动编辑。
- 点击 `Send` 后，当前文本清空并进入练习页现有消息流程。
- 如果浏览器不支持 Web Speech API，页面显示手动输入提示。

Step 6 API 验证重点：

```text
POST http://localhost:3000/api/chat
```

请求示例：

```json
{
  "scenario": "job-interview",
  "messages": [
    {
      "id": "demo-user-message",
      "role": "user",
      "content": "I want to introduce myself.",
      "createdAt": "2026-06-05T00:00:00.000Z"
    }
  ]
}
```

返回示例：

```json
{
  "reply": "Sure. Please introduce yourself and tell me about your background.",
  "provider": "deepseek"
}
```

如果没有配置 DeepSeek API Key，`provider` 会返回 `fallback`。

Step 8 API 验证重点：

```text
POST http://localhost:3000/api/report
```

请求示例：

```json
{
  "scenario": "job-interview",
  "messages": [],
  "corrections": [],
  "durationSeconds": 600
}
```

如果没有配置 DeepSeek API Key，`provider` 会返回 `fallback`。练习页点击 `End` 后应跳转到 `/report/[sessionId]` 并展示本地报告。

Step 9 API 验证重点：

```text
POST http://localhost:3000/api/sessions
GET http://localhost:3000/api/sessions
```

需要确认：

- 未配置 Supabase 时，练习结束后报告页仍可通过 localStorage 正常展示。
- 配置 Supabase 后，练习结束会写入 `practice_sessions`。
- 聊天消息会写入 `practice_messages`。
- 纠错记录会写入 `practice_corrections`。

Step 10 页面验证重点：

```text
http://localhost:3000/history
```

需要确认：

- 未配置 Supabase 时，完成练习后历史页能显示 localStorage 记录。
- 配置 Supabase 后，历史页能显示 Supabase 记录。
- 点击 `Report` 能进入 `/report/[sessionId]`。
- 报告页能展示 localStorage 或 Supabase 中保存的报告详情。

Step 11 页面验证重点：

```text
http://localhost:3000/practice?scenario=job-interview
http://localhost:3000/history
http://localhost:3000/report/demo-session
```

需要确认：

- 发送消息时聊天区和反馈区都有明确 loading 状态。
- AI API 或保存接口 fallback 时页面显示可读提示。
- 历史页加载、空状态和 localStorage fallback 状态正常显示。
- 报告页加载和未找到状态正常显示。

Step 12 页面验证重点：

```text
http://localhost:3000/practice?scenario=job-interview
```

需要确认：

- 输入英文句子并点击 `Send` 后，聊天区立即出现 TalkMate AI 回复气泡。
- AI 回复内容会逐步输出，而不是等待完整回复后一次性出现。
- 右侧即时纠错面板仍会正常显示本轮反馈。
- 未配置 DeepSeek API 时，页面仍能通过 fallback 流式回复继续演示。

Step 12 API 验证重点：

```text
POST http://localhost:3000/api/chat/stream
```

返回格式为 SSE：

```text
event: token
data: {"token":"Good "}

event: done
data: {"provider":"deepseek"}
```

Step 13 页面验证重点：

```text
http://localhost:3000
http://localhost:3000/scenarios
http://localhost:3000/practice?scenario=job-interview
http://localhost:3000/history
```

需要确认：

- 首页、场景选择页、练习页、历史页和报告页的主要界面文案为中文。
- 英文对话内容、AI 回复、纠错后的英文句子和练习句子仍保持英文。
- 语音识别错误、fallback 提示和空状态提示显示为中文。

Step 14 页面验证重点：

```text
http://localhost:3000/practice?scenario=job-interview
```

需要确认：

- 输入英文句子并点击发送后，AI 回复仍然流式显示。
- 网络 chunk 被正确拼接为完整 SSE 消息，token 内容不丢失、不截断。
- 回复输出节奏更加平滑，没有因为 token 过碎导致明显卡顿。
- DeepSeek 网络异常时，流式接口不会长时间等待，会在超时后返回 fallback 回复。
- SSE 流结束后最后一段文本完整显示。
- 即时纠错面板仍能正常生成反馈。

Step 15 页面验证重点：

```text
http://localhost:3000/practice?scenario=job-interview
```

需要确认：

- 连续发送多轮消息后，顶部场景栏仍保持可见。
- 聊天消息区可以独立滚动，页面整体不会被长对话无限撑高。
- 底部输入框、发送按钮和结束按钮始终可操作。
- 桌面端右侧即时反馈面板在滚动时保持可见。

Step 16 页面验证重点：

```text
http://localhost:3000/practice?scenario=job-interview
```

需要确认：

- 发送英文回答后，AI 回复生成完成并自动播放语音。
- 语音播放时页面显示 `AI 正在朗读`。
- 播放期间开始录音或发送下一轮消息，会停止上一段朗读。
- 浏览器不支持语音播放时，页面显示提示且文字练习流程继续可用。

Step 17 页面验证重点：

```text
http://localhost:3000/practice?scenario=job-interview
```

需要确认：

- 聊天区位于底部时，发送新消息和 AI 流式回复会自动跟随到底部。
- 手动向上滚动查看历史消息后，后续流式 token 不会强制拉回底部。
- 再次发送新消息时，聊天区会重新回到底部。

Step 18 页面验证重点：

```text
http://localhost:3000/practice?scenario=job-interview
```

需要确认：

- AI 回复语音播放失败时，页面显示语音播放提示。
- 点击提示右侧关闭按钮后，提示会立即消失。
- 连续发送多轮消息时，上一段播放不会影响当前播放状态。
- 浏览器可用英文语音加载后，AI 回复朗读更稳定。

Step 19 API 验证重点：

```text
POST http://localhost:3000/api/correction
```

需要确认：

- `hello,what is your name?` 这类文本不会再把首字母大小写、逗号空格作为主要错误。
- `taxi` 这类短回答会被引导扩展成自然完整的口语句子。
- 当上一轮 AI 问的是 yes/no 或二选一问题时，`yes, please` 会按上下文判断，不会简单判为语法错误。
- 真实语法、用词、词序或表达完整度问题仍会正常给出纠错建议。

Step 7 API 验证重点：

```text
POST http://localhost:3000/api/correction
```

请求示例：

```json
{
  "text": "I go to company yesterday.",
  "scenario": "job-interview"
}
```

返回示例：

```json
{
  "original": "I go to company yesterday.",
  "corrected": "I went to the company yesterday.",
  "reason": "Use the past tense because the action happened yesterday.",
  "betterExpression": "I visited the company yesterday.",
  "scores": {
    "grammar": 72,
    "fluency": 76,
    "vocabulary": 70,
    "pronunciation": 75
  },
  "provider": "deepseek"
}
```

如果没有配置 DeepSeek API Key，`provider` 会返回 `fallback`。

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
  api/chat/stream/route.ts
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

状态：**已完成**

目标：

- 完成第一个可用入口流程。
- 用户可以从 `/` 进入 `/scenarios`。
- 用户可以选择四个指定口语练习场景之一。

### Step 4：实现练习页基础 UI

状态：**已完成**

目标：

- 创建聊天区域、右侧反馈区域和底部输入控制区。
- 在接入真实 AI 与语音功能前，先保证页面结构可用。

### Step 5：实现 Web Speech API 语音识别 Hook

状态：**已完成**

目标：

- 支持浏览器语音识别。
- 浏览器不支持时提供手动文本输入兜底。

### Step 6：实现 AI 对话 API

状态：**已完成**

目标：

- 实现 `POST /api/chat`。
- 根据练习场景生成简短、自然、只使用英文的 AI 回复。

### Step 7：实现即时纠错 API

状态：**已完成**

目标：

- 实现 `POST /api/correction`。
- 返回严格 JSON，包括原句、修改后句子、错误原因、更自然表达和各项评分。

### Step 8：实现课后报告 API

状态：**已完成**

目标：

- 实现 `POST /api/report`。
- 根据完整对话和纠错记录生成本次练习报告 JSON。

### Step 9：实现 Supabase 历史记录保存

状态：**已完成**

目标：

- 添加数据库表结构。
- 保存练习会话、聊天消息和纠错记录。
- 如果 Supabase 暂未配置，保留 localStorage 兜底方案。

### Step 10：实现历史记录页和报告页

状态：**已完成**

目标：

- 展示历史练习记录。
- 展示指定练习会话的详细报告。

### Step 11：优化 UI、Loading、错误处理和空状态

状态：**已完成**

目标：

- 提升交互体验。
- 补齐加载状态、空状态和错误提示。
- 为最终 Demo 录制做准备。

### Step 12：实现 SSE 流式 AI 回复

状态：**已完成**

目标：

- 新增流式对话 API。
- 让练习页 AI 回复逐步显示。
- 保留即时纠错并行请求和 fallback 演示能力。

### Step 13：中文化主要界面文案

状态：**已完成**

目标：

- 降低中文用户查看和演示成本。
- 中文化主要页面标题、按钮、状态提示和报告栏目。
- 保留英文练习内容，避免影响英语口语训练。

### Step 14：优化 SSE 流式回复的前端双缓冲渲染

状态：**已完成**

目标：

- 解耦网络 chunk 到达、SSE 消息解析和 React 渲染节奏。
- 确保前端只处理完整 SSE 消息。
- 减少流式回复时的高频状态更新。
- 保持用户看到的流式输出更加平滑自然。

### Step 15：优化练习页长对话布局

状态：**已完成**

目标：

- 长对话时保持顶部场景信息和底部输入控制可见。
- 让聊天区独立滚动，降低页面跳动和迷失感。
- 提升练习页在桌面端连续使用时的可操作性。

### Step 16：实现 AI 回复语音播放

状态：**已完成**

目标：

- 让 AI 英文回复可以被浏览器自动朗读。
- 增强口语陪练的听说练习体验。
- 在浏览器不支持时保持主流程可用。

### Step 17：实现聊天区条件跟随滚动

状态：**已完成**

目标：

- 让长对话和流式回复时的滚动行为更自然。
- 用户在底部时自动跟随最新回复。
- 用户查看历史消息时不打断阅读位置。

### Step 18：修复语音播放提示和稳定性

状态：**已完成**

目标：

- 让语音播放失败提示可以被用户手动关闭。
- 减少 SpeechSynthesis 取消后立刻播放导致的异常。
- 避免旧播放事件干扰当前朗读状态。

### Step 19：优化实时纠错的口语反馈质量

状态：**开发中**

目标：

- 让即时反馈更关注口语表达是否自然、完整、易理解。
- 让即时反馈参考上一轮 AI 提问，判断回答是否真正回应了问题。
- 避免把大小写、标点、逗号空格等语音识别文本格式问题当作主要错误。
- 对简短回答给出可直接跟读的完整表达。

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

建议第三个 commit：

```text
feat: build home and scenario selection pages
```

建议第四个 commit：

```text
feat: build practice page base UI
```

建议第五个 commit：

```text
feat: add speech recognition hook
```

建议第六个 commit：

```text
feat: add AI chat API
```

建议第七个 commit：

```text
feat: add instant correction API
```

建议第八个 commit：

```text
feat: add learning report API
```

建议第九个 PR 标题：

```text
feat: add Supabase session history
```

建议第十个 PR 标题：

```text
feat: add history and saved report pages
```

建议第十一个 PR 标题：

```text
feat: improve UI loading and error states
```

建议第十二个 PR 标题：

```text
feat: stream AI chat responses with SSE
```

建议第十三个 PR 标题：

```text
feat: localize main UI text to Chinese
```

建议第十四个 PR 标题：

```text
feat: buffer streamed chat rendering
```

建议第十五个 PR 标题：

```text
fix: keep practice controls visible during long chats
```

建议第十六个 PR 标题：

```text
feat: add AI speech playback
```

建议第十七个 PR 标题：

```text
feat: add conditional chat autoscroll
```

建议第十八个 PR 标题：

```text
fix: improve speech playback notice handling
```

建议第十九个 PR 标题：

```text
feat: improve instant feedback speaking focus
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

完成 Step 19 PR 后，继续拆分 README、Demo 指南和最终 polish PR。
