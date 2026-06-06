# TalkMate AI Demo Guide

本文档用于准备演示视频和评审复现流程。

## 演示目标

展示 TalkMate AI 的完整口语练习闭环：

```text
场景选择 -> 进入练习 -> AI 对话 -> 即时反馈 -> 课后报告 -> 历史记录
```

建议演示场景选择：

```text
旅行出行
```

## 环境准备

本地安装依赖：

```bash
npm.cmd install
```

复制环境变量：

```text
.env.example -> .env.local
```

填写 DeepSeek 配置：

```env
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_CHAT_STREAM_TIMEOUT_MS=15000
```

填写 Supabase 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Supabase 建表

打开 Supabase 项目后台，进入：

```text
SQL Editor -> New query
```

复制并运行：

```text
supabase/schema.sql
```

如果 Supabase 提示是否启用 RLS，demo 阶段选择：

```text
Run without RLS
```

建表成功后应出现：

```text
practice_sessions
practice_messages
practice_corrections
```

## 启动项目

```bash
npm.cmd run dev -- -p 3000
```

访问：

```text
http://localhost:3000
```

## 推荐录制流程

1. 打开首页，点击开始练习。
2. 进入场景选择页，选择旅行出行。
3. 进入练习页，展示左侧对话区和右侧即时反馈区。
4. 输入：

```text
do you have any recommendation
```

5. 等待 AI 回复和即时反馈生成。
6. 展示右侧推荐表达：

```text
Do you have any recommendations?
```

7. 继续输入一个上下文短回答，例如：

```text
bus schedule,please
```

8. 展示即时反馈不会编造新的偏好或理由，只做轻微润色。
9. 点击结束，生成课后报告。
10. 展示报告中的总结、常见问题、改进建议、练习句子和口语任务。
11. 返回历史记录页，确认数据来源为 Supabase。
12. 打开刚才生成的历史报告。

## 推荐演示点

- AI 回复使用 SSE 流式输出。
- 即时反馈只展示一个推荐表达，避免修改后和更自然表达重复。
- 推荐表达会保持用户原意。
- 上下文中成立的短回答不会被强行扩写。
- 课后报告不会强行凑满常见问题。
- 历史记录从 Supabase 读取。
- 未配置 Supabase 时仍可使用 localStorage fallback。

## 清理旧演示数据

如果需要重录 demo，可以清空 Supabase 中的数据表。

建议清空顺序：

```text
practice_corrections
practice_messages
practice_sessions
```

如果浏览器本地仍显示旧报告，可以在开发者工具 Console 中执行：

```js
Object.keys(localStorage)
  .filter((key) => key.startsWith("talkmate-report-"))
  .forEach((key) => localStorage.removeItem(key));
```

然后刷新 `/history`。

## 备用说明

如果 DeepSeek API 暂时不可用，系统会进入 fallback 回复，主流程仍可继续演示。

如果 Supabase 未配置，练习报告会保存到当前浏览器 localStorage，历史页会显示本地数据来源。

## 录制前检查

- DeepSeek API key 已配置。
- Supabase 三张表已创建。
- `.env.local` 不要出现在视频画面中。
- 首页、练习页、报告页、历史页都能正常打开。
- 生成报告后，历史页显示数据来源为 Supabase。
