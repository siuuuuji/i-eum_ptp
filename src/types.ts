// PRD 9.1 핵심 데이터 개체를 클라이언트 전용(로컬 저장) 구조로 단순화했다.
// 실제 서버/DB 연결(9장의 행 단위 권한, 감사 로그 등)은 이번 범위에서 제외했다.

export type MemberRole = "recorder" | "family_admin" | "family_member";
export type Visibility = "family" | "private" | "custom";
export type UnresolvedFieldType = "name" | "date" | "place";

export interface UnresolvedItem {
  field: UnresolvedFieldType;
  note: string;
}

export interface FamilyMember {
  id: string;
  displayName: string;
  relationship: string; // 딸, 아들, 손녀 등
  role: MemberRole;
}

export interface FamilyGroup {
  id: string;
  name: string;
  inviteCode: string;
  recorderId: string;
  members: FamilyMember[];
}

export interface AiVoiceSettings {
  voiceName: string;
  tone: "warm" | "calm" | "bright";
  rate: "slow" | "normal" | "fast";
  address: string; // 호칭, 예: 어머니
}

export interface RecorderProfile {
  id: string;
  displayName: string;
  aiVoice: AiVoiceSettings;
  defaultVisibility: Visibility;
}

export type ConversationStatus = "idle" | "listening" | "speaking" | "paused" | "completed" | "abandoned";

export interface ConversationTurn {
  id: string;
  speaker: "ai" | "user";
  text: string;
  at: string;
}

export interface ConversationSession {
  id: string;
  category: string;
  mainQuestion: string;
  turns: ConversationTurn[];
  status: ConversationStatus;
  startedAt: string;
  updatedAt: string;
  followUpCount: number;
}

export interface EditHistoryEntry {
  at: string;
  field: string;
  summary: string;
}

export interface MemoryRecord {
  id: string;
  recorderId: string;
  sessionId?: string;
  category: string;
  question: string;
  title: string;
  summary: string;
  transcript: string;
  tags: string[];
  visibility: Visibility;
  visibleToMemberIds: string[]; // custom일 때만 사용
  hasVoiceNote: boolean;
  unresolved: UnresolvedItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  history: EditHistoryEntry[];
}

export type PageStatus = "insufficient" | "draft" | "needs_review" | "approved";

export interface BookPage {
  id: string;
  chapterId: string;
  order: number;
  title: string;
  body: string;
  sourceMemoryIds: string[];
  unresolved: UnresolvedItem[];
  status: PageStatus;
  visibility: Visibility;
  approvedAt: string | null;
  generatedAt: string | null;
}

export interface BookChapter {
  id: string;
  order: number;
  title: string;
  theme: string;
}

export type NewsInputType = "text" | "photo" | "voice";
export type NewsStatus = "draft" | "scheduled" | "broadcast" | "cancelled";

export interface FamilyNewsItem {
  id: string;
  authorId: string;
  authorName: string;
  relationship: string;
  type: NewsInputType;
  body: string;
  photoCaption?: string;
  pronunciationNote?: string;
  status: NewsStatus;
  createdAt: string;
  episodeId: string | null;
}

export interface RadioSegment {
  id: string;
  newsItemId: string;
  authorName: string;
  relationship: string;
  text: string;
  order: number;
}

export type EpisodeStatus = "empty" | "scheduled" | "generating" | "ready" | "failed";

export interface RadioEpisode {
  id: string;
  dateLabel: string;
  status: EpisodeStatus;
  title: string;
  intro: string;
  segments: RadioSegment[];
  createdAt: string;
  playedAt: string | null;
  errorMessage?: string;
}

export interface ScheduleSettings {
  conversationTime: string; // "09:00"
  radioTimes: string[]; // ["08:00", "19:00"]
  timezone: string;
  notifyConversation: boolean;
  notifyRadio: boolean;
  autoplayRadio: boolean;
}

export type FontScale = 0.92 | 1 | 1.2;

export interface AccessibilitySettings {
  fontScale: FontScale;
  highContrast: boolean;
  captionsAlways: boolean;
}

export interface ConsentState {
  requiredAccepted: boolean;
  voiceProcessing: boolean;
  aiGeneration: boolean;
  familySharing: boolean;
  acceptedAt: string | null;
}

export interface AppState {
  onboardingComplete: boolean;
  activeViewerId: string; // 데모용 현재 로그인 사용자(가족 구성원 id)
  family: FamilyGroup;
  recorderProfile: RecorderProfile;
  consent: ConsentState;
  schedule: ScheduleSettings;
  accessibility: AccessibilitySettings;
  memories: MemoryRecord[];
  chapters: BookChapter[];
  pages: BookPage[];
  newsItems: FamilyNewsItem[];
  episodes: RadioEpisode[];
  activeSession: ConversationSession | null;
}
