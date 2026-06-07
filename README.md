# TalkMate AI

TalkMate AI 是一个 Web 端 AI 英语口语陪练平台，面向英语学习者提供场景化对话练习、即时口语反馈、课后学习报告和历史记录追踪。

项目目标是在浏览器中完成一条完整的口语练习闭环：

```text
选择练习场景 -> 语音/文本输入 -> AI 英语对话 -> 即时反馈 -> 课后报告 -> 历史记录
```

## Demo

- GitHub 仓库：https://github.com/yetuge/TalkMate-AI
- Demo 视频：https://www.bilibili.com/video/BV1G1Ex6VE1J/?vd_source=2a9e89e2b1a2a2616c6fe2b964e9bd8c
- Demo 指南：[DEMO_GUIDE.md](./DEMO_GUIDE.md)
- 开发进度：[DEVELOPMENT_PROGRESS.md](./DEVELOPMENT_PROGRESS.md)

## 核心功能

- 场景化口语练习：支持面试、点餐、商务会议、旅行出行等常见英文交流场景。
- AI 实时对话：根据不同场景 Prompt 引导 AI 扮演面试官、服务员、同事或旅行助手。
- SSE 流式回复：AI 回复逐步输出，并通过前端缓冲优化渲染节奏。
- 语音输入：接入浏览器 Web Speech API，支持语音识别为文本。
- AI 语音播放：使用浏览器 SpeechSynthesis 朗读 AI 英文回复。
- 即时反馈：根据上一轮 AI 提问和用户最新回答，给出原句、推荐表达、原因和多维评分。
- 上下文判断：短回答在当前对话中成立时，不强行扩写，也不编造用户没有表达过的原因、态度或偏好。
- 课后报告：基于真实对话和即时反馈生成总结、常见问题、改进建议、练习句子和口语任务。
- 历史记录：练习数据优先保存到 Supabase，未配置时使用 localStorage 兜底。

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- DeepSeek API

## 本地运行

安装依赖：

```bash
npm.cmd install
```

复制环境变量文件：

```text
.env.example -> .env.local
```

填写必要环境变量后启动项目：

```bash
npm.cmd run dev -- -p 3000
```

访问：

```text
http://localhost:3000
```

## 环境变量

```env
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_CHAT_STREAM_TIMEOUT_MS=15000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

说明：

- DeepSeek 配置用于 AI 对话、即时反馈和课后报告生成。
- Supabase 配置用于保存练习记录、对话消息和纠错反馈。
- 未配置 Supabase 时，项目会使用 localStorage 作为备用存储。

## Supabase 建表

数据库建表 SQL 位于：

```text
supabase/schema.sql
```

在 Supabase 控制台中进入：

```text
SQL Editor -> New query
```

复制 `supabase/schema.sql` 内容并运行。建表成功后应包含：

```text
practice_sessions
practice_messages
practice_corrections
```

Demo 阶段可以选择 `Run without RLS`，便于快速复现完整流程。

## 主要页面

```text
/                         首页
/scenarios                场景选择
/practice?scenario=travel 口语练习
/history                  历史记录
/report/[sessionId]       课后报告
```

## API 路由

```text
/api/chat/stream   SSE 流式 AI 对话
/api/correction    即时反馈
/api/report        课后报告
/api/sessions      练习历史
```

## 推荐演示流程

1. 打开首页，点击开始练习。
2. 进入场景选择页，选择旅行出行。
3. 在练习页输入或说出英文回答。
4. 观察 AI 流式回复和右侧即时反馈。
5. 输入带有代表性的错误句子，例如 `do you have any recommendation`。
6. 查看推荐表达 `Do you have any recommendations?`。
7. 输入上下文短回答，例如 `bus schedule, please`，观察系统不会强行扩写。
8. 点击结束练习，生成课后报告。
9. 进入历史记录页，查看 Supabase 保存的练习记录和报告。

## 项目状态

当前版本已经完成核心 MVP 和 Demo 所需功能：

- 完整口语练习闭环已打通。
- DeepSeek API、SSE、语音识别、语音播放已接入。
- 即时反馈和课后报告 Prompt 已针对口语练习质量进行优化。
- Supabase 历史记录已可用于演示和复现。

