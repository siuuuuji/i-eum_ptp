import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { BoardState, Task, UserId, Urgency } from "../types";
import { createSeedTasks } from "./seed";

const BOARD_KEY = "malang.board.v1";
const VIEWER_KEY = "malang.viewer.v1";
const CHANNEL_NAME = "malang.board";

type Listener = () => void;

/* ------------------------------------------------------------------ *
 * 저장소
 * ------------------------------------------------------------------ */

function emptyState(): BoardState {
  return { tasks: [], lastEvent: null };
}

function reviveTask(raw: unknown): Task | null {
  if (typeof raw !== "object" || raw === null) return null;
  const t = raw as Partial<Task>;
  if (typeof t.id !== "string" || typeof t.title !== "string") return null;
  if (t.assigneeId !== "baekrak" && t.assigneeId !== "mallang") return null;
  if (t.assignerId !== "baekrak" && t.assignerId !== "mallang") return null;
  return {
    id: t.id,
    title: t.title,
    note: typeof t.note === "string" ? t.note : "",
    assignerId: t.assignerId,
    assigneeId: t.assigneeId,
    createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
    dueAt: typeof t.dueAt === "number" ? t.dueAt : null,
    completedAt: typeof t.completedAt === "number" ? t.completedAt : null,
    urgency: t.urgency === "soft" || t.urgency === "urgent" ? t.urgency : "normal"
  };
}

function parseState(raw: string | null): BoardState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<BoardState>;
    if (!Array.isArray(parsed.tasks)) return null;
    const tasks = parsed.tasks.map(reviveTask).filter((t): t is Task => t !== null);
    return { tasks, lastEvent: parsed.lastEvent ?? null };
  } catch {
    return null;
  }
}

function loadInitial(): BoardState {
  if (typeof window === "undefined") return emptyState();
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(BOARD_KEY);
  } catch {
    stored = null;
  }
  const parsed = parseState(stored);
  if (parsed) return parsed;
  return { tasks: createSeedTasks(Date.now()), lastEvent: null };
}

let state: BoardState = loadInitial();
const listeners = new Set<Listener>();

let channel: BroadcastChannel | null = null;
if (typeof BroadcastChannel !== "undefined") {
  channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event: MessageEvent) => {
    const payload = event.data as { type?: string; state?: BoardState } | null;
    if (payload?.type === "state" && payload.state) {
      state = payload.state;
      listeners.forEach((l) => l());
    }
  };
}

if (typeof window !== "undefined") {
  // BroadcastChannel이 없는 브라우저를 위한 보조 경로.
  window.addEventListener("storage", (event) => {
    if (event.key !== BOARD_KEY) return;
    const next = parseState(event.newValue);
    if (!next) return;
    state = next;
    listeners.forEach((l) => l());
  });
}

function persist(next: BoardState) {
  try {
    window.localStorage.setItem(BOARD_KEY, JSON.stringify(next));
  } catch {
    /* 저장 공간이 막혀 있어도 화면은 계속 동작한다. */
  }
}

function commit(next: BoardState) {
  state = next;
  persist(next);
  channel?.postMessage({ type: "state", state: next });
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getBoard(): BoardState {
  return state;
}

export function useBoard(): BoardState {
  return useSyncExternalStore(subscribe, getBoard, getBoard);
}

/* ------------------------------------------------------------------ *
 * 행동
 * ------------------------------------------------------------------ */

export interface NewTaskInput {
  title: string;
  note: string;
  assignerId: UserId;
  assigneeId: UserId;
  dueAt: number | null;
  urgency: Urgency;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const boardActions = {
  assign(input: NewTaskInput): Task {
    const task: Task = {
      id: newId(),
      title: input.title.trim(),
      note: input.note.trim(),
      assignerId: input.assignerId,
      assigneeId: input.assigneeId,
      createdAt: Date.now(),
      dueAt: input.dueAt,
      completedAt: null,
      urgency: input.urgency
    };
    commit({
      tasks: [task, ...state.tasks],
      lastEvent: { type: "assign", taskId: task.id, at: task.createdAt }
    });
    return task;
  },

  complete(id: string) {
    const at = Date.now();
    let changed = false;
    const tasks = state.tasks.map((t) => {
      if (t.id !== id || t.completedAt !== null) return t;
      changed = true;
      return { ...t, completedAt: at };
    });
    if (!changed) return;
    commit({ tasks, lastEvent: { type: "complete", taskId: id, at } });
  },

  reopen(id: string) {
    const at = Date.now();
    let changed = false;
    const tasks = state.tasks.map((t) => {
      if (t.id !== id || t.completedAt === null) return t;
      changed = true;
      return { ...t, completedAt: null };
    });
    if (!changed) return;
    commit({ tasks, lastEvent: { type: "reopen", taskId: id, at } });
  },

  remove(id: string) {
    commit({
      tasks: state.tasks.filter((t) => t.id !== id),
      lastEvent: state.lastEvent?.taskId === id ? null : state.lastEvent
    });
  },

  clearEvent() {
    if (!state.lastEvent) return;
    commit({ tasks: state.tasks, lastEvent: null });
  },

  resetDemo() {
    commit({ tasks: createSeedTasks(Date.now()), lastEvent: null });
  },

  clearAll() {
    commit({ tasks: [], lastEvent: null });
  }
};

/* ------------------------------------------------------------------ *
 * 보는 사람 (탭마다 다른 역할로 열어 둘 수 있게 sessionStorage에 둔다)
 * ------------------------------------------------------------------ */

function loadViewer(): UserId {
  try {
    const stored = window.sessionStorage.getItem(VIEWER_KEY);
    if (stored === "baekrak" || stored === "mallang") return stored;
  } catch {
    /* 무시 */
  }
  return "baekrak";
}

export function useViewer(): [UserId, (next: UserId) => void] {
  const [viewer, setViewerState] = useState<UserId>(() =>
    typeof window === "undefined" ? "baekrak" : loadViewer()
  );

  const setViewer = useCallback((next: UserId) => {
    setViewerState(next);
    try {
      window.sessionStorage.setItem(VIEWER_KEY, next);
    } catch {
      /* 무시 */
    }
  }, []);

  return [viewer, setViewer];
}

/* ------------------------------------------------------------------ *
 * 시계
 * ------------------------------------------------------------------ */

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
