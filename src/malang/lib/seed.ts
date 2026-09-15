import type { Task } from "../types";
import { DAY, HOUR, MINUTE, startOfDay } from "./time";

function makeId(suffix: string): string {
  return `seed-${suffix}`;
}

/** 첫 방문에 대시보드와 캘린더가 비어 보이지 않도록 심어 두는 숲의 기록. */
export function createSeedTasks(now: number): Task[] {
  const today = startOfDay(now);

  return [
    {
      id: makeId("1"),
      title: "이슬 맺힌 수정 열매 모으기",
      note: "동쪽 폭포 아래 무지개가 뜨는 자리에 제일 굵은 열매가 있어.",
      assignerId: "baekrak",
      assigneeId: "mallang",
      createdAt: now - 2 * HOUR - 12 * MINUTE,
      dueAt: now + 3 * HOUR,
      completedAt: null,
      urgency: "normal"
    },
    {
      id: makeId("2"),
      title: "숲 입구 팻말에 낀 이끼 닦기",
      note: "'숲을 지키는 천리말랑이' 글씨가 안 보이면 길 잃은 아이들이 헤매.",
      assignerId: "baekrak",
      assigneeId: "mallang",
      createdAt: now - 26 * MINUTE,
      dueAt: now + 20 * HOUR,
      completedAt: null,
      urgency: "soft"
    },
    {
      id: makeId("3"),
      title: "상위 1%의 성으로 가는 지도 다시 그리기",
      note: "구름다리가 무너진 구간을 새로 표시해 둘 것.",
      assignerId: "baekrak",
      assigneeId: "baekrak",
      createdAt: now - 5 * HOUR,
      dueAt: now + 2 * DAY,
      completedAt: null,
      urgency: "normal"
    },
    {
      id: makeId("4"),
      title: "울타리 넘어온 고블린 정리하기",
      note: "한 입에 꿀꺽. 뼈는 남기지 말기.",
      assignerId: "baekrak",
      assigneeId: "mallang",
      createdAt: today + 8 * HOUR,
      dueAt: today + 12 * HOUR,
      completedAt: today + 11 * HOUR + 20 * MINUTE,
      urgency: "urgent"
    },
    {
      id: makeId("5"),
      title: "정령 등불 심지 갈기",
      note: "",
      assignerId: "baekrak",
      assigneeId: "baekrak",
      createdAt: today - DAY + 9 * HOUR,
      dueAt: today - DAY + 18 * HOUR,
      completedAt: today - DAY + 15 * HOUR,
      urgency: "normal"
    },
    {
      id: makeId("6"),
      title: "왕관 광내기",
      note: "말랑말랑한 부분에 흠집 나지 않게 살살.",
      assignerId: "mallang",
      assigneeId: "mallang",
      createdAt: today - DAY + 10 * HOUR,
      dueAt: today - DAY + 20 * HOUR,
      completedAt: today - DAY + 19 * HOUR,
      urgency: "soft"
    },
    {
      id: makeId("7"),
      title: "흰 사슴에게 인사하고 오기",
      note: "폭포 위 아치 근처에서 기다리고 있대.",
      assignerId: "baekrak",
      assigneeId: "mallang",
      createdAt: today - 2 * DAY + 9 * HOUR,
      dueAt: today - 2 * DAY + 17 * HOUR,
      completedAt: today - 2 * DAY + 16 * HOUR + 10 * MINUTE,
      urgency: "normal"
    },
    {
      id: makeId("8"),
      title: "여정 짐 꾸리기",
      note: "등불, 두루마리, 말랑이 간식.",
      assignerId: "baekrak",
      assigneeId: "baekrak",
      createdAt: today - 3 * DAY + 11 * HOUR,
      dueAt: today - 3 * DAY + 21 * HOUR,
      completedAt: today - 3 * DAY + 20 * HOUR + 40 * MINUTE,
      urgency: "normal"
    }
  ];
}
