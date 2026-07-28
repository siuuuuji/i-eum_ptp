export interface QuestionCategory {
  id: string;
  label: string;
  mainQuestions: string[];
  followUpDirections: string[];
}

// PRD 7.2 질문 설계 표를 기반으로 카테고리별 주 질문과 후속 질문 방향을 정리했다.
export const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    id: "childhood",
    label: "어린 시절",
    mainQuestions: [
      "어릴 때 가장 자주 놀던 곳은 어디였나요?",
      "어릴 적 살던 동네는 어떤 모습이었나요?"
    ],
    followUpDirections: ["함께한 사람", "그때의 소리나 냄새", "계절이나 날씨"]
  },
  {
    id: "school",
    label: "학교와 배움",
    mainQuestions: [
      "학교에서 유난히 기억나는 선생님이 계셨나요?",
      "학창 시절 가장 친했던 친구는 누구였나요?"
    ],
    followUpDirections: ["그때 배운 점", "당시 느꼈던 감정", "함께한 친구들"]
  },
  {
    id: "work",
    label: "일과 성취",
    mainQuestions: [
      "처음 돈을 벌었던 날을 기억하시나요?",
      "일하면서 가장 자랑스러웠던 순간은 언제였나요?"
    ],
    followUpDirections: ["일하던 방식", "자랑스러웠던 순간", "함께 일한 사람들"]
  },
  {
    id: "family",
    label: "가족과 관계",
    mainQuestions: [
      "가족과 함께 먹으면 생각나는 음식이 있나요?",
      "결혼식 날, 혹은 특별했던 가족 행사가 기억나시나요?"
    ],
    followUpDirections: ["누가 만들었는지", "특별했던 날", "그 자리에 있던 사람들"]
  },
  {
    id: "neighborhood",
    label: "동네와 시대",
    mainQuestions: [
      "예전 동네에서 지금은 사라진 것이 있나요?",
      "그 시절 동네 사람들은 어떻게 지냈나요?"
    ],
    followUpDirections: ["그 장소", "함께했던 사람", "달라진 느낌"]
  },
  {
    id: "taste",
    label: "취향과 감각",
    mainQuestions: [
      "들으면 젊은 시절이 떠오르는 노래가 있나요?",
      "가장 좋아했던 계절이나 색이 있었나요?"
    ],
    followUpDirections: ["그 장면", "함께 있던 사람", "그 시절 생활 모습"]
  },
  {
    id: "wisdom",
    label: "가치와 지혜",
    mainQuestions: [
      "다시 젊은 사람에게 꼭 해주고 싶은 말이 있나요?",
      "살면서 가장 중요하다고 느낀 가치는 무엇인가요?"
    ],
    followUpDirections: ["그 생각을 갖게 된 경험", "그 경험 속 사람들", "지금 돌아본 느낌"]
  }
];

export function pickDailyCategory(seedIndex: number): QuestionCategory {
  return QUESTION_CATEGORIES[seedIndex % QUESTION_CATEGORIES.length];
}

export function pickMainQuestion(category: QuestionCategory, seedIndex: number): string {
  return category.mainQuestions[seedIndex % category.mainQuestions.length];
}
