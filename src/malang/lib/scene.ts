import type { BoardState, Task } from "../types";
import { PERSONAS } from "../types";
import { josa } from "./persona";
import { POKE_AFTER } from "./time";

export type SceneKey = "celebrate" | "allclear" | "overdue" | "poke" | "idle";

/** 완료 직후 축하 장면이 머무는 시간 */
export const CELEBRATE_WINDOW = 8_000;

export interface Scene {
  key: SceneKey;
  image: string;
  /** 접근성용 대체 텍스트 */
  alt: string;
  badge: string;
  headline: string;
  caption: string;
  /** 레퍼런스 그림 위에 얹는 손글씨 말풍선 */
  shout: string;
  murmur: string[];
  focus: Task | null;
}

const IMAGES: Record<SceneKey, string> = {
  poke: "/malang/scene-poke.webp",
  celebrate: "/malang/scene-clear.webp",
  overdue: "/malang/scene-overdue.webp",
  allclear: "/malang/scene-allclear.webp",
  idle: "/malang/scene-poke.webp"
};

const ALTS: Record<SceneKey, string> = {
  poke: "백락정령이 왕관을 쓴 천리말랑이를 손끝으로 콕 찌르는 장면",
  celebrate: "천리말랑이가 숲으로 넘어온 고블린들을 한입에 삼키는 장면",
  overdue: "백락정령이 울먹이는 천리말랑이의 볼을 양손으로 누르는 장면",
  allclear: "백락정령과 동료가 서로 기대어 웃고, 옆에서 천리말랑이가 함께 웃는 장면",
  idle: "햇살이 스며든 숲에서 백락정령과 천리말랑이가 나란히 쉬는 장면"
};

export function isOpen(task: Task): boolean {
  return task.completedAt === null;
}

export function isOverdue(task: Task, now: number): boolean {
  return isOpen(task) && task.dueAt !== null && now > task.dueAt;
}

export function isPoking(task: Task, now: number): boolean {
  return isOpen(task) && now - task.createdAt >= POKE_AFTER;
}

export function isLate(task: Task): boolean {
  return task.completedAt !== null && task.dueAt !== null && task.completedAt > task.dueAt;
}

/** 말랑이의 일을 먼저 본다. 대시보드 알림은 말랑이의 진행을 기준으로 삼기 때문. */
function rank(task: Task): number {
  return task.assigneeId === "mallang" ? 0 : 1;
}

function pick(tasks: Task[], predicate: (t: Task) => boolean, key: (t: Task) => number): Task | null {
  const hits = tasks.filter(predicate).sort((a, b) => rank(a) - rank(b) || key(a) - key(b));
  return hits[0] ?? null;
}

export function deriveScene(board: BoardState, now: number, override?: SceneKey | null): Scene {
  const { tasks, lastEvent } = board;
  const open = tasks.filter(isOpen);

  const justCompleted =
    lastEvent?.type === "complete" && now - lastEvent.at < CELEBRATE_WINDOW
      ? tasks.find((t) => t.id === lastEvent.taskId) ?? null
      : null;

  const overdueTask = pick(tasks, (t) => isOverdue(t, now), (t) => t.dueAt ?? 0);
  const pokeTask = pick(tasks, (t) => isPoking(t, now), (t) => t.createdAt);

  let key: SceneKey;
  let focus: Task | null = null;

  if (override) {
    key = override;
    focus =
      override === "celebrate"
        ? justCompleted ?? tasks.find((t) => t.completedAt !== null) ?? null
        : override === "overdue"
          ? overdueTask
          : override === "poke"
            ? pokeTask
            : null;
  } else if (justCompleted) {
    key = "celebrate";
    focus = justCompleted;
  } else if (tasks.length > 0 && open.length === 0) {
    key = "allclear";
  } else if (overdueTask) {
    key = "overdue";
    focus = overdueTask;
  } else if (pokeTask) {
    key = "poke";
    focus = pokeTask;
  } else {
    key = "idle";
  }

  return { ...copyFor(key, focus, tasks), image: IMAGES[key], alt: ALTS[key], key, focus };
}

type SceneCopy = Pick<Scene, "badge" | "headline" | "caption" | "shout" | "murmur">;

function copyFor(key: SceneKey, focus: Task | null, tasks: Task[]): SceneCopy {
  const who = focus ? PERSONAS[focus.assigneeId].name : PERSONAS.mallang.name;
  const whoSubject = josa(who, "이가");
  const whoObject = josa(who, "을를");

  switch (key) {
    case "celebrate":
      return {
        badge: "하나 해치웠다",
        headline: focus ? `『${focus.title}』 완료!` : "일 하나를 해냈어요",
        caption: `${whoSubject} 숲을 어지럽히던 일을 한입에 삼켰어요. 꿀꺽!`,
        shout: "와아아앙!!",
        murmur: ["와아…!!", "말랑이…!!", "너무 기특해…!"]
      };
    case "allclear": {
      const done = tasks.filter((t) => t.completedAt !== null).length;
      return {
        badge: "두루마리가 텅 비었어요",
        headline: "오늘 맡긴 일을 전부 끝냈어요",
        caption: `모두 ${done}개. 더 멀리, 더 높이 — 우리의 모험은 이제부터예요.`,
        shout: "다 했다…!",
        murmur: ["오늘은 여기까지 다 왔네.", "잘했어, 말랑아."]
      };
    }
    case "overdue":
      return {
        badge: "기한을 넘겼어요",
        headline: focus ? `『${focus.title}』 기한 초과` : "약속한 시간이 지났어요",
        caption: `백락정령이 정해준 시간 안에 끝내지 못했어요. ${who}의 볼이 눌리는 중…`,
        shout: "마아알라앙…!!",
        murmur: ["시간… 다 지났잖아…!", "다음엔 꼭, 응…?"]
      };
    case "poke":
      return {
        badge: "맡긴 지 한 시간",
        headline: focus ? `『${focus.title}』 아직 그대로예요` : "한 시간째 그대로예요",
        caption: `백락정령이 손끝으로 ${whoObject} 콕콕 찌르고 있어요.`,
        shout: "콕. 콕.",
        murmur: ["말랑아…", "이거, 아직 안 했지…?"]
      };
    case "idle":
    default:
      return {
        badge: "숲이 고요해요",
        headline: "새로 맡길 일을 적어 볼까요",
        caption: "햇살이 좋은 시간. 급한 일도, 늦은 일도 없어요.",
        shout: "",
        murmur: ["오늘은 평화롭네.", "천천히 해도 괜찮아."]
      };
  }
}

/** 무대에 미리 깔아 두는 모든 레퍼런스 그림 (교차 페이드용) */
export const SCENE_IMAGES: string[] = Array.from(new Set(Object.values(IMAGES)));

export const JOURNEY_IMAGE = "/malang/scene-journey.webp";
export const JOURNEY_ALT =
  "백락정령과 천리말랑이가 짐을 꾸리고 구름 위 '상위 1%의 성'을 바라보는 장면";

/** 그림마다 인물이 가려지지 않는 초점 */
export const ART_FOCAL: Record<string, string> = {
  "/malang/scene-poke.webp": "50% 46%",
  "/malang/scene-clear.webp": "52% 60%",
  "/malang/scene-overdue.webp": "50% 46%",
  "/malang/scene-allclear.webp": "50% 44%",
  "/malang/scene-journey.webp": "50% 44%"
};

export const SCENE_PREVIEWS: { key: SceneKey; label: string }[] = [
  { key: "idle", label: "고요한 숲" },
  { key: "poke", label: "1시간 경과" },
  { key: "celebrate", label: "완료" },
  { key: "overdue", label: "기한 초과" },
  { key: "allclear", label: "모두 완료" }
];
