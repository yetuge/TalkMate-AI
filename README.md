# TalkMate AI

TalkMate AI 是一个 Web 端 AI 英语口语陪练应用，目标是在浏览器中实现完整的口语练习闭环：

```text
场景选择 -> 语音/文本输入 -> AI 英语对话 -> 即时纠错 -> 课后报告 -> 历史记录
```

## GitHub 仓库

https://github.com/yetuge/TalkMate-AI

## 技术栈

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Supabase
- DeepSeek API

## 当前进度

- Step 1：初始化项目结构和依赖，已完成。
- Step 2：实现场景数据和页面路由，已完成。
- Step 3：实现首页和场景选择页，已完成。
- Step 4：实现练习页基础 UI，已完成。
- Step 5：实现 Web Speech API 语音识别 Hook，已完成。
- Step 6：实现 AI 对话 API，已完成。
- Step 7：实现即时纠错 API，已完成。
- Step 8：实现课后报告 API，已完成。
- Step 9：实现 Supabase 历史记录保存，已完成。
- Step 10：实现历史记录页和报告详情读取，已完成。
- Step 11：优化 UI、Loading、错误处理和空状态，已完成。

详细记录见 [DEVELOPMENT_PROGRESS.md](./DEVELOPMENT_PROGRESS.md)。

## 本地运行

```bash
npm.cmd install
npm.cmd run dev -- -p 3000
```

访问地址：

```text
http://localhost:3000
```

## 已有路由

```text
/
/scenarios
/practice?scenario=job-interview
/history
/report/demo-session
/api/chat
/api/correction
/api/report
```

## 当前可用流程

```text
打开首页 -> 点击 Start Practice -> 选择场景 -> 进入练习页 -> 语音识别或手动输入 -> 发送文本 -> 获取 AI 英文回复 -> 查看即时纠错反馈 -> 结束练习 -> 查看课后报告
```

说明：当前练习页已经接入浏览器 Web Speech API 语音识别，并通过 `/api/chat` 调用 DeepSeek API 生成 AI 回复，通过 `/api/correction` 生成即时纠错反馈，通过 `/api/report` 生成课后报告。报告暂存于 localStorage，Supabase 历史记录将在后续步骤接入。

Step 9 已新增 Supabase 保存接口。配置 Supabase 后，练习结束会保存 session、messages 和 corrections；未配置时继续使用 localStorage 兜底。

Step 10 已实现历史记录页。历史页会优先读取 Supabase 练习记录；未配置 Supabase 或本地演示时，会读取 localStorage 中的报告记录。

Step 11 已统一练习页、历史页和报告页的加载、错误、fallback 和空状态展示。

## 环境变量

复制 `.env.example` 为 `.env.local`，并按需填写：

```text
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Supabase 数据表

数据库建表 SQL 位于：

```text
supabase/schema.sql
```
