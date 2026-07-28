import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AccessibilitySettings,
  AiVoiceSettings,
  AppState,
  BookPage,
  ConsentState,
  ConversationSession,
  ConversationStatus,
  ConversationTurn,
  FamilyNewsItem,
  MemoryRecord,
  PageStatus,
  RadioEpisode,
  ScheduleSettings,
  UnresolvedItem,
  Visibility
} from "../types";
import { buildInitialState } from "../data/seed";
import { readLocal, writeLocal } from "../lib/storage";
import { nowIso, uid } from "../lib/id";

const STORAGE_KEY = "ieum-app-state-v1";
const SCHEMA_VERSION = 1;

interface StoredShape {
  v: number;
  state: AppState;
}

function loadInitial(): AppState {
  const fallback = buildInitialState();
  const stored = readLocal<StoredShape | null>(STORAGE_KEY, null);
  if (stored && stored.v === SCHEMA_VERSION && stored.state) {
    return stored.state;
  }
  return fallback;
}

export interface NewMemoryInput {
  category: string;
  question: string;
  title: string;
  summary: string;
  transcript: string;
  tags: string[];
  visibility: Visibility;
  visibleToMemberIds: string[];
  unresolved: UnresolvedItem[];
  hasVoiceNote: boolean;
  sessionId?: string;
}

interface StoreValue {
  state: AppState;
  setActiveViewer: (memberId: string) => void;
  completeOnboarding: (consent: Omit<ConsentState, "acceptedAt">) => void;
  updateAiVoice: (patch: Partial<AiVoiceSettings>) => void;
  updateSchedule: (patch: Partial<ScheduleSettings>) => void;
  updateAccessibility: (patch: Partial<AccessibilitySettings>) => void;
  updateDefaultVisibility: (visibility: Visibility) => void;

  startSession: (category: string, question: string) => ConversationSession;
  appendTurn: (turn: Omit<ConversationTurn, "id" | "at">) => void;
  setSessionStatus: (status: ConversationStatus) => void;
  incrementFollowUp: () => void;
  clearSession: () => void;

  saveMemory: (input: NewMemoryInput) => MemoryRecord;
  updateMemory: (id: string, patch: Partial<MemoryRecord>, historySummary?: string) => void;
  setMemoryVisibility: (id: string, visibility: Visibility, visibleToMemberIds: string[]) => void;
  softDeleteMemory: (id: string) => void;
  restoreMemory: (id: string) => void;

  commitPageDraft: (
    chapterId: string,
    page: { title: string; body: string; sourceMemoryIds: string[]; unresolved: UnresolvedItem[]; status: PageStatus; visibility: Visibility }
  ) => void;
  approvePage: (pageId: string) => void;
  markPageFailed: (pageId: string) => void;

  addNewsItem: (item: Omit<FamilyNewsItem, "id" | "createdAt" | "status" | "episodeId">) => FamilyNewsItem;
  updateNewsItem: (id: string, patch: Partial<FamilyNewsItem>) => void;
  cancelNewsItem: (id: string) => void;

  commitEpisode: (episode: RadioEpisode, newsItemIds: string[]) => void;
  markEpisodePlayed: (episodeId: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadInitial);

  useEffect(() => {
    writeLocal<StoredShape>(STORAGE_KEY, { v: SCHEMA_VERSION, state });
  }, [state]);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(state.accessibility.fontScale));
    document.documentElement.setAttribute("data-contrast", state.accessibility.highContrast ? "high" : "normal");
  }, [state.accessibility]);

  const value = useMemo<StoreValue>(() => {
    const setActiveViewer = (memberId: string) =>
      setState((s) => ({ ...s, activeViewerId: memberId }));

    const completeOnboarding = (consent: Omit<ConsentState, "acceptedAt">) =>
      setState((s) => ({
        ...s,
        onboardingComplete: true,
        consent: { ...consent, acceptedAt: nowIso() }
      }));

    const updateAiVoice = (patch: Partial<AiVoiceSettings>) =>
      setState((s) => ({
        ...s,
        recorderProfile: { ...s.recorderProfile, aiVoice: { ...s.recorderProfile.aiVoice, ...patch } }
      }));

    const updateSchedule = (patch: Partial<ScheduleSettings>) =>
      setState((s) => ({ ...s, schedule: { ...s.schedule, ...patch } }));

    const updateAccessibility = (patch: Partial<AccessibilitySettings>) =>
      setState((s) => ({ ...s, accessibility: { ...s.accessibility, ...patch } }));

    const updateDefaultVisibility = (visibility: Visibility) =>
      setState((s) => ({ ...s, recorderProfile: { ...s.recorderProfile, defaultVisibility: visibility } }));

    const startSession = (category: string, question: string): ConversationSession => {
      const session: ConversationSession = {
        id: uid(),
        category,
        mainQuestion: question,
        turns: [{ id: uid(), speaker: "ai", text: question, at: nowIso() }],
        status: "speaking",
        startedAt: nowIso(),
        updatedAt: nowIso(),
        followUpCount: 0
      };
      setState((s) => ({ ...s, activeSession: session }));
      return session;
    };

    const appendTurn = (turn: Omit<ConversationTurn, "id" | "at">) =>
      setState((s) => {
        if (!s.activeSession) return s;
        const next: ConversationSession = {
          ...s.activeSession,
          turns: [...s.activeSession.turns, { ...turn, id: uid(), at: nowIso() }],
          updatedAt: nowIso()
        };
        return { ...s, activeSession: next };
      });

    const setSessionStatus = (status: ConversationStatus) =>
      setState((s) => (s.activeSession ? { ...s, activeSession: { ...s.activeSession, status, updatedAt: nowIso() } } : s));

    const incrementFollowUp = () =>
      setState((s) =>
        s.activeSession ? { ...s, activeSession: { ...s.activeSession, followUpCount: s.activeSession.followUpCount + 1 } } : s
      );

    const clearSession = () => setState((s) => ({ ...s, activeSession: null }));

    const saveMemory = (input: NewMemoryInput): MemoryRecord => {
      const memory: MemoryRecord = {
        id: uid(),
        recorderId: state.recorderProfile.id,
        sessionId: input.sessionId,
        category: input.category,
        question: input.question,
        title: input.title,
        summary: input.summary,
        transcript: input.transcript,
        tags: input.tags,
        visibility: input.visibility,
        visibleToMemberIds: input.visibleToMemberIds,
        hasVoiceNote: input.hasVoiceNote,
        unresolved: input.unresolved,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        deletedAt: null,
        history: []
      };
      setState((s) => ({ ...s, memories: [memory, ...s.memories], activeSession: null }));
      return memory;
    };

    const updateMemory = (id: string, patch: Partial<MemoryRecord>, historySummary?: string) =>
      setState((s) => ({
        ...s,
        memories: s.memories.map((m) =>
          m.id === id
            ? {
                ...m,
                ...patch,
                updatedAt: nowIso(),
                history: historySummary ? [{ at: nowIso(), field: "content", summary: historySummary }, ...m.history] : m.history
              }
            : m
        )
      }));

    const setMemoryVisibility = (id: string, visibility: Visibility, visibleToMemberIds: string[]) =>
      setState((s) => ({
        ...s,
        memories: s.memories.map((m) =>
          m.id === id
            ? {
                ...m,
                visibility,
                visibleToMemberIds,
                updatedAt: nowIso(),
                history: [{ at: nowIso(), field: "visibility", summary: `공개 범위를 변경했어요` }, ...m.history]
              }
            : m
        )
      }));

    const softDeleteMemory = (id: string) =>
      setState((s) => ({ ...s, memories: s.memories.map((m) => (m.id === id ? { ...m, deletedAt: nowIso() } : m)) }));

    const restoreMemory = (id: string) =>
      setState((s) => ({ ...s, memories: s.memories.map((m) => (m.id === id ? { ...m, deletedAt: null } : m)) }));

    const commitPageDraft: StoreValue["commitPageDraft"] = (chapterId, page) =>
      setState((s) => {
        const existing = s.pages.find((p) => p.chapterId === chapterId);
        const nextPage: BookPage = {
          id: existing?.id ?? uid(),
          chapterId,
          order: existing?.order ?? 1,
          title: page.title,
          body: page.body,
          sourceMemoryIds: page.sourceMemoryIds,
          unresolved: page.unresolved,
          status: page.status,
          visibility: page.visibility,
          approvedAt: null,
          generatedAt: nowIso()
        };
        const pages = existing ? s.pages.map((p) => (p.id === existing.id ? nextPage : p)) : [...s.pages, nextPage];
        return { ...s, pages };
      });

    const approvePage = (pageId: string) =>
      setState((s) => ({
        ...s,
        pages: s.pages.map((p) => (p.id === pageId ? { ...p, status: "approved", approvedAt: nowIso() } : p))
      }));

    const markPageFailed = (pageId: string) =>
      setState((s) => ({ ...s, pages: s.pages.map((p) => (p.id === pageId ? { ...p, status: p.status } : p)) }));

    const addNewsItem: StoreValue["addNewsItem"] = (item) => {
      const created: FamilyNewsItem = { ...item, id: uid(), createdAt: nowIso(), status: "scheduled", episodeId: null };
      setState((s) => ({ ...s, newsItems: [created, ...s.newsItems] }));
      return created;
    };

    const updateNewsItem = (id: string, patch: Partial<FamilyNewsItem>) =>
      setState((s) => ({ ...s, newsItems: s.newsItems.map((n) => (n.id === id ? { ...n, ...patch } : n)) }));

    const cancelNewsItem = (id: string) =>
      setState((s) => ({ ...s, newsItems: s.newsItems.map((n) => (n.id === id ? { ...n, status: "cancelled" } : n)) }));

    const commitEpisode = (episode: RadioEpisode, newsItemIds: string[]) =>
      setState((s) => ({
        ...s,
        episodes: [episode, ...s.episodes],
        newsItems: s.newsItems.map((n) => (newsItemIds.includes(n.id) ? { ...n, status: "broadcast", episodeId: episode.id } : n))
      }));

    const markEpisodePlayed = (episodeId: string) =>
      setState((s) => ({
        ...s,
        episodes: s.episodes.map((e) => (e.id === episodeId ? { ...e, playedAt: e.playedAt ?? nowIso() } : e))
      }));

    return {
      state,
      setActiveViewer,
      completeOnboarding,
      updateAiVoice,
      updateSchedule,
      updateAccessibility,
      updateDefaultVisibility,
      startSession,
      appendTurn,
      setSessionStatus,
      incrementFollowUp,
      clearSession,
      saveMemory,
      updateMemory,
      setMemoryVisibility,
      softDeleteMemory,
      restoreMemory,
      commitPageDraft,
      approvePage,
      markPageFailed,
      addNewsItem,
      updateNewsItem,
      cancelNewsItem,
      commitEpisode,
      markEpisodePlayed
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore는 StoreProvider 내부에서만 사용할 수 있어요.");
  return ctx;
}
