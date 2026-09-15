export type UserId = "baekrak" | "mallang";

export type Urgency = "soft" | "normal" | "urgent";

export interface Task {
  id: string;
  title: string;
  note: string;
  /** 이 일을 맡긴 사람 (보통 백락정령) */
  assignerId: UserId;
  /** 이 일을 해내야 하는 사람 */
  assigneeId: UserId;
  createdAt: number;
  /** 백락정령이 정해준 기한. 없으면 자유 과제 */
  dueAt: number | null;
  completedAt: number | null;
  urgency: Urgency;
}

export interface BoardEvent {
  type: "complete" | "assign" | "reopen";
  taskId: string;
  at: number;
}

export interface BoardState {
  tasks: Task[];
  lastEvent: BoardEvent | null;
}

export interface Persona {
  id: UserId;
  name: string;
  title: string;
  /** 문장(紋章)으로 쓰는 글리프 */
  sigil: string;
  accent: string;
  accentSoft: string;
}

export const PERSONAS: Record<UserId, Persona> = {
  baekrak: {
    id: "baekrak",
    name: "백락정령",
    title: "숲의 인도자",
    sigil: "✦",
    accent: "#cfa95f",
    accentSoft: "rgba(207, 169, 95, 0.18)"
  },
  mallang: {
    id: "mallang",
    name: "천리말랑이",
    title: "숲을 지키는 왕관",
    sigil: "♛",
    accent: "#d9899f",
    accentSoft: "rgba(217, 137, 159, 0.18)"
  }
};

export const USER_IDS: UserId[] = ["baekrak", "mallang"];
