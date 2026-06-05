# Web端 AI英语口语陪练应用开发 Prompt

你是一名资深全栈工程师，请帮我开发一个 Web 端 AI 英语口语陪练应用，项目名叫 **TalkMate AI**。

目标：在浏览器中实现“场景选择 → 语音输入 → AI英语对话 → 即时纠错 → 课后总结 → 历史记录”的完整闭环。

只做 Web 端，不做移动端 App。

---

## 一、技术栈

请使用：

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Supabase
- DeepSeek API（OpenAI-compatible）

优先保证项目能跑通，功能完整度优先于复杂架构。

---

## 二、页面结构

请实现以下页面：

### 1. 首页 `/`

展示：

- 产品名称：TalkMate AI
- Slogan：Practice Real English Conversations with AI
- 开始练习按钮
- 功能介绍：
  - 场景口语练习
  - AI实时对话
  - 语法纠错
  - 课后总结
  - 成长追踪

点击开始练习进入 `/scenarios`。

---

### 2. 场景选择页 `/scenarios`

展示 4 个场景卡片：

#### Job Interview

描述：练习英文面试、自我介绍、职业经历表达。

难度：Hard

开场问题：

Tell me about yourself.

---

#### Restaurant Ordering

描述：练习点餐、询问菜单、结账等表达。

难度：Easy

开场问题：

What would you like to order today?

---

#### Business Meeting

描述：练习会议讨论、表达观点、项目沟通。

难度：Medium

开场问题：

What do you think about this project plan?

---

#### Travel

描述：练习酒店入住、问路、交通出行。

难度：Easy

开场问题：

How can I help you with your trip?

点击场景后进入：

`/practice?scenario=job-interview`

---

### 3. 练习页 `/practice`

页面布局：

左侧：聊天区域
右侧：即时反馈区域
底部：语音输入控制区

聊天区域包含：

- AI消息气泡
- 用户消息气泡
- AI正在思考状态
- AI正在说话状态
- 打字机效果

右侧反馈区域包含：

- 原句
- 修改后句子
- 错误原因
- 更自然表达
- 本轮评分

底部控制区包含：

- 开始录音按钮
- 停止录音按钮
- 当前识别文本
- 发送按钮
- 结束练习按钮

---

### 4. 报告页 `/report/[sessionId]`

展示本次练习总结：

- 总分
- 语法评分
- 流利度评分
- 词汇评分
- 发音评分
- 高频错误
- 改进建议
- 推荐练习句子
- 推荐口语任务

---

### 5. 历史记录页 `/history`

展示：

- 每次练习的场景
- 日期
- 总分
- 练习时长
- 查看报告按钮

---

## 三、核心功能细节

## 功能 1：场景化对话

AI必须根据不同场景扮演不同角色。

### 面试场景

AI角色：英文面试官。

要求：

- 提问简洁专业
- 围绕自我介绍、项目经历、职业规划展开
- 鼓励用户多说

---

### 点餐场景

AI角色：餐厅服务员。

要求：

- 询问用户想吃什么
- 引导用户完成点餐、确认订单、结账
- 语言简单自然

---

### 商务会议场景

AI角色：会议主持人或同事。

要求：

- 围绕项目计划、风险、方案讨论
- 引导用户表达观点
- 使用商务英语

---

### 旅行场景

AI角色：酒店前台或旅行助手。

要求：

- 练习问路、入住、交通、求助
- 语言清晰，适合初学者

---

## 功能 2：语音输入

优先使用浏览器 Web Speech API。

实现要求：

- 点击“开始录音”后开始识别
- 实时显示识别中的文本
- 点击“停止录音”后结束识别
- 用户可以手动编辑识别结果
- 点击“发送”后进入对话流程

如果浏览器不支持 Web Speech API：

显示提示：

当前浏览器不支持语音识别，请手动输入文本。

并提供文本输入框。

---

## 功能 3：AI 对话回复

用户发送一句英文后：

流程：

1. 将用户输入加入聊天列表
2. 调用 `/api/chat`
3. AI根据场景和上下文生成英文回复
4. AI回复显示在聊天区域
5. 调用浏览器 SpeechSynthesis 播放 AI 回复

AI回复要求：

- 必须使用英文
- 每次回复控制在 1-3 句话
- 不要太长
- 要继续推动对话
- 可以适当鼓励用户

---

## 功能 4：即时纠错

每次用户发送内容后，同时调用 `/api/correction`。

返回 JSON：

{
"original": "I go to company yesterday.",
"corrected": "I went to the company yesterday.",
"reason": "You should use the past tense because the action happened yesterday.",
"betterExpression": "I visited the company yesterday.",
"scores": {
"grammar": 72,
"fluency": 76,
"vocabulary": 70,
"pronunciation": 75
}
}

右侧反馈区域展示这些内容。

如果用户句子没有明显错误，也要返回：

- 表达不错
- 一个更自然表达
- 本轮评分

---

## 功能 5：课后总结

用户点击“结束练习”后：

调用 `/api/report`。

输入：

- 当前场景
- 完整对话消息
- 所有纠错记录
- 练习时长

输出 JSON：

{
"overallScore": 82,
"scores": {
"grammar": 85,
"fluency": 80,
"vocabulary": 78,
"pronunciation": 82
},
"commonMistakes": [
"Past tense mistakes",
"Missing articles",
"Limited vocabulary"
],
"suggestions": [
"Practice using past tense in interview answers.",
"Use more transition words.",
"Try to give longer answers."
],
"practiceSentences": [
"I worked on a hotel booking system.",
"I improved the user experience by optimizing page loading."
],
"speakingTasks": [
"Introduce yourself in one minute.",
"Describe one project you built."
],
"summary": "You performed well in basic communication, but you should improve grammar accuracy and sentence variety."
}

然后跳转到报告页。

---

## 功能 6：历史记录

每次练习结束后保存到 Supabase。

保存内容：

- 用户ID
- 场景
- 开始时间
- 结束时间
- 总分
- 各项评分
- 对话内容
- 纠错记录
- 总结报告

历史页按时间倒序展示。

---

## 四、数据库设计

请创建以下表：

### practice_sessions

字段：

- id uuid primary key
- user_id uuid
- scenario text
- started_at timestamp
- ended_at timestamp
- duration_seconds int
- overall_score int
- grammar_score int
- fluency_score int
- vocabulary_score int
- pronunciation_score int
- report jsonb
- created_at timestamp

---

### practice_messages

字段：

- id uuid primary key
- session_id uuid
- role text
- content text
- created_at timestamp

---

### practice_corrections

字段：

- id uuid primary key
- session_id uuid
- original text
- corrected text
- reason text
- better_expression text
- scores jsonb
- created_at timestamp

---

## 五、API 设计

请实现：

### POST `/api/chat`

输入：

{
"scenario": "job-interview",
"messages": [
{ "role": "user", "content": "I want introduce myself." }
]
}

输出：

{
"reply": "Sure. Please introduce yourself and tell me about your background."
}

---

### POST `/api/correction`

输入：

{
"text": "I go to company yesterday.",
"scenario": "job-interview"
}

输出：

{
"original": "...",
"corrected": "...",
"reason": "...",
"betterExpression": "...",
"scores": {
"grammar": 72,
"fluency": 76,
"vocabulary": 70,
"pronunciation": 75
}
}

---

### POST `/api/report`

输入：

{
"scenario": "job-interview",
"messages": [],
"corrections": [],
"durationSeconds": 600
}

输出：

完整学习报告 JSON。

---

### POST `/api/sessions`

保存练习结果到 Supabase。

---

### GET `/api/sessions`

获取历史练习记录。

---

## 六、Prompt 模板

### Chat Prompt

你是一位专业英语口语陪练老师。

当前场景是：{{scenario}}

你的任务：

- 只用英文回复
- 回复简短自然
- 每次回复 1 到 3 句话
- 引导用户继续说英语
- 根据用户水平调整难度
- 不要直接用中文解释
- 不要一次性问太多问题

对话历史：

{{messages}}

请生成下一句 AI 回复。

---

### Correction Prompt

你是一名专业英语老师。

请分析用户英文句子：

{{text}}

当前练习场景：

{{scenario}}

请返回严格 JSON，不要输出 markdown。

格式：

{
"original": "",
"corrected": "",
"reason": "",
"betterExpression": "",
"scores": {
"grammar": 0,
"fluency": 0,
"vocabulary": 0,
"pronunciation": 0
}
}

评分规则：

- grammar：语法准确度
- fluency：表达流畅度
- vocabulary：词汇丰富度
- pronunciation：如果没有真实音频，则根据文本流畅度估算，默认不要低于70

---

### Report Prompt

你是一名英语学习分析师。

请根据用户本次练习生成学习报告。

输入包含：

- 场景
- 完整对话
- 每轮纠错
- 练习时长

请返回严格 JSON，不要输出 markdown。

格式：

{
"overallScore": 0,
"scores": {
"grammar": 0,
"fluency": 0,
"vocabulary": 0,
"pronunciation": 0
},
"commonMistakes": [],
"suggestions": [],
"practiceSentences": [],
"speakingTasks": [],
"summary": ""
}

要求：

- commonMistakes 至少 3 条
- suggestions 至少 3 条
- practiceSentences 至少 5 句
- speakingTasks 至少 5 个
- summary 用中文总结

---

## 七、前端组件拆分

请至少拆分以下组件：

components/

- ScenarioCard.tsx
- ChatMessage.tsx
- VoiceRecorder.tsx
- FeedbackPanel.tsx
- ScoreCard.tsx
- ReportCard.tsx
- HistoryItem.tsx
- LoadingDots.tsx

hooks/

- useSpeechRecognition.ts
- useSpeechSynthesis.ts
- usePracticeSession.ts

lib/

- openai.ts
- supabase.ts
- prompts.ts
- scenarios.ts
- types.ts

---

## 八、状态管理设计

练习页需要维护：

- 当前场景 scenario
- 消息列表 messages
- 当前识别文本 transcript
- 是否录音 isRecording
- 是否AI生成中 isLoading
- 是否AI正在说话 isSpeaking
- 当前反馈 currentFeedback
- 所有反馈 corrections
- 开始时间 startedAt

发送消息流程：

1. 校验输入不为空
2. 添加用户消息
3. 清空输入框
4. 并行调用 chat 和 correction
5. 显示 AI 回复
6. 播放 AI 回复
7. 更新右侧反馈
8. 保存本轮消息和反馈到本地状态

---

## 九、UI 风格

整体风格：

- 简洁
- 现代
- 教育科技感
- 类似 ChatGPT + Duolingo

颜色：

- 主色：蓝紫渐变
- 背景：浅灰或深色都可以
- 卡片：圆角、阴影
- 按钮：明显、有反馈

练习页布局：

桌面端：

左侧 70% 聊天区
右侧 30% 反馈区

移动端：

上下布局。

---

## 十、开发顺序

请严格按照以下顺序开发：

### Step 1

初始化项目结构，安装依赖。

### Step 2

实现场景数据和页面路由。

### Step 3

实现首页和场景选择页。

### Step 4

实现练习页基础 UI。

### Step 5

实现 Web Speech API 语音识别 Hook。

### Step 6

实现 AI 对话 API。

### Step 7

实现即时纠错 API。

### Step 8

实现课后报告 API。

### Step 9

实现 Supabase 保存历史记录。

### Step 10

实现历史记录页和报告页。

### Step 11

优化 UI、Loading、错误处理、空状态。

---

## 十一、注意事项

请不要一次性写复杂功能。

优先保证：

1. 用户能选择场景
2. 用户能说一句英语
3. 系统能识别成文本
4. AI能回复英文
5. 系统能给出纠错
6. 结束后能生成报告

这是比赛 MVP 主流程。

如果某些功能复杂，可以先用可运行的简化版。

例如：

- 发音评分可以先根据文本流畅度估算
- 语音播放可以先用浏览器 SpeechSynthesis
- 登录可以先做匿名用户或本地存储
- 历史记录可以先用 localStorage，后续再接 Supabase

最终目标是做出一个可演示、完整、流畅的 Web 端作品。
