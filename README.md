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
- OpenAI API

## 当前进度

- Step 1：初始化项目结构和依赖，已完成。
- Step 2：实现场景数据和页面路由，已完成。
- Step 3：实现首页和场景选择页，已完成。
- Step 4：实现练习页基础 UI，已完成。
- Step 5：实现 Web Speech API 语音识别 Hook，已完成。

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
```

## 当前可用流程

```text
打开首页 -> 点击 Start Practice -> 选择场景 -> 进入练习页 -> 语音识别或手动输入 -> 发送文本 -> 查看模拟 AI 回复和即时反馈
```

说明：当前练习页已经接入浏览器 Web Speech API 语音识别，并保留手动输入兜底。AI 回复和纠错反馈仍使用本地 UI 模拟，OpenAI API 将在后续步骤接入。

## 环境变量

复制 `.env.example` 为 `.env.local`，并按需填写：

```text
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
