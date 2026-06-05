import type { Scenario, ScenarioId } from "@/lib/types";

export const scenarios: Scenario[] = [
  {
    id: "job-interview",
    title: "Job Interview",
    description:
      "Practice English interviews, self-introductions, and career experience answers.",
    difficulty: "Hard",
    openingQuestion: "Tell me about yourself.",
    aiRole: "English interviewer",
    goals: [
      "Introduce your background clearly.",
      "Describe project and work experience.",
      "Answer career planning questions with confidence.",
    ],
  },
  {
    id: "restaurant-ordering",
    title: "Restaurant Ordering",
    description:
      "Practice ordering food, asking about the menu, confirming orders, and paying.",
    difficulty: "Easy",
    openingQuestion: "What would you like to order today?",
    aiRole: "Restaurant server",
    goals: [
      "Ask about menu items.",
      "Place and confirm an order.",
      "Handle payment in natural English.",
    ],
  },
  {
    id: "business-meeting",
    title: "Business Meeting",
    description:
      "Practice discussing plans, sharing opinions, and communicating project updates.",
    difficulty: "Medium",
    openingQuestion: "What do you think about this project plan?",
    aiRole: "Meeting host or colleague",
    goals: [
      "Express opinions in business English.",
      "Discuss risks and project plans.",
      "Respond to meeting questions naturally.",
    ],
  },
  {
    id: "travel",
    title: "Travel",
    description:
      "Practice hotel check-ins, directions, transport questions, and travel help.",
    difficulty: "Easy",
    openingQuestion: "How can I help you with your trip?",
    aiRole: "Hotel front desk agent or travel assistant",
    goals: [
      "Ask for directions.",
      "Check in at a hotel.",
      "Ask for help with transport and travel plans.",
    ],
  },
];

export const scenarioMap = scenarios.reduce(
  (map, scenario) => {
    map[scenario.id] = scenario;
    return map;
  },
  {} as Record<ScenarioId, Scenario>,
);

export function getScenarioById(id: string | null | undefined) {
  if (!id) {
    return undefined;
  }

  return scenarios.find((scenario) => scenario.id === id);
}
