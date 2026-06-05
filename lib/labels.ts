import type { ScenarioId, ScoreBreakdown } from "@/lib/types";

export const scenarioLabels: Record<
  ScenarioId,
  {
    title: string;
    description: string;
    aiRole: string;
    goals: string[];
  }
> = {
  "job-interview": {
    title: "求职面试",
    description: "练习英文面试、自我介绍和工作经历表达。",
    aiRole: "AI 面试官",
    goals: ["清楚介绍个人背景", "描述项目和工作经历", "自信回答职业规划问题"],
  },
  "restaurant-ordering": {
    title: "餐厅点餐",
    description: "练习点餐、询问菜单、确认订单和付款表达。",
    aiRole: "AI 餐厅服务员",
    goals: ["询问菜单内容", "完成并确认点餐", "自然处理付款场景"],
  },
  "business-meeting": {
    title: "商务会议",
    description: "练习讨论计划、表达观点和沟通项目进展。",
    aiRole: "AI 会议同事",
    goals: ["用商务英语表达观点", "讨论风险和项目计划", "自然回应会议问题"],
  },
  travel: {
    title: "旅行出行",
    description: "练习酒店入住、问路、交通咨询和旅行求助。",
    aiRole: "AI 旅行助手",
    goals: ["询问路线", "办理酒店入住", "寻求交通和旅行帮助"],
  },
};

export const difficultyLabels = {
  Easy: "简单",
  Medium: "中等",
  Hard: "困难",
} as const;

export const scoreLabels: Record<keyof ScoreBreakdown, string> = {
  grammar: "语法",
  fluency: "流利度",
  vocabulary: "词汇",
  pronunciation: "发音",
};

export function getScenarioLabel(id: ScenarioId) {
  return scenarioLabels[id];
}
