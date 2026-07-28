import type {
  AppState,
  BookChapter,
  BookPage,
  FamilyGroup,
  FamilyNewsItem,
  MemoryRecord,
  RadioEpisode,
  RecorderProfile
} from "../types";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();

export const RECORDER_ID = "m-recorder";
export const FAMILY_ADMIN_ID = "m-admin";
export const FAMILY_MEMBER_ID = "m-member";

export function buildFamily(): FamilyGroup {
  return {
    id: "family-1",
    name: "정순이네 가족",
    inviteCode: "IEUM26",
    recorderId: RECORDER_ID,
    members: [
      { id: RECORDER_ID, displayName: "김정순", relationship: "본인", role: "recorder" },
      { id: FAMILY_ADMIN_ID, displayName: "이지영", relationship: "딸", role: "family_admin" },
      { id: FAMILY_MEMBER_ID, displayName: "이민준", relationship: "손자", role: "family_member" }
    ]
  };
}

export function buildRecorderProfile(): RecorderProfile {
  return {
    id: RECORDER_ID,
    displayName: "김정순",
    aiVoice: { voiceName: "차분한 여성 목소리", tone: "warm", rate: "normal", address: "정순 님" },
    defaultVisibility: "family"
  };
}

export function buildMemories(): MemoryRecord[] {
  const m1: MemoryRecord = {
    id: "mem-1",
    recorderId: RECORDER_ID,
    category: "childhood",
    question: "어릴 때 가장 자주 놀던 곳은 어디였나요?",
    title: "국민학교 앞 방앗간 골목",
    summary: "학교 마치고 친구들과 방앗간 골목에서 자주 놀았던 기억.",
    transcript:
      "학교가 끝나면 늘 방앗간 골목으로 갔어요. 떡 찌는 냄새가 온 골목에 퍼져 있었고, 친구들이랑 고무줄놀이도 하고 딱지도 쳤죠. 지금도 눈을 감으면 그 냄새가 나는 것 같아요.",
    tags: ["어린시절", "친구", "고향"],
    visibility: "family",
    visibleToMemberIds: [],
    hasVoiceNote: true,
    unresolved: [],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
    deletedAt: null,
    history: []
  };

  const m2: MemoryRecord = {
    id: "mem-2",
    recorderId: RECORDER_ID,
    category: "family",
    question: "힘들었던 시절, 가족에게도 말하지 못한 이야기가 있나요?",
    title: "혼자 견뎠던 그 겨울",
    summary: "누구에게도 쉽게 꺼내지 못했던 개인적인 기억.",
    transcript: "그때는 아무한테도 말 못했어요. 지금도 나만 간직하고 싶은 이야기예요.",
    tags: ["개인적인 기억"],
    visibility: "private",
    visibleToMemberIds: [],
    hasVoiceNote: false,
    unresolved: [],
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    deletedAt: null,
    history: []
  };

  const m3: MemoryRecord = {
    id: "mem-3",
    recorderId: RECORDER_ID,
    category: "work",
    question: "처음 돈을 벌었던 날을 기억하시나요?",
    title: "첫 월급 봉투",
    summary: "첫 직장에서 받은 월급 봉투에 얽힌 이야기. 딸에게만 공개.",
    transcript:
      "첫 월급을 받던 날, 봉투를 열어보지도 않고 어머니께 먼저 드렸어요. 그날 어머니 얼굴이 아직도 생생해요.",
    tags: ["첫직장", "가족"],
    visibility: "custom",
    visibleToMemberIds: [FAMILY_ADMIN_ID],
    hasVoiceNote: true,
    unresolved: [],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    deletedAt: null,
    history: []
  };

  const m4: MemoryRecord = {
    id: "mem-4",
    recorderId: RECORDER_ID,
    category: "wisdom",
    question: "다시 젊은 사람에게 꼭 해주고 싶은 말이 있나요?",
    title: "천천히 가도 괜찮다는 말",
    summary: "삶의 속도에 대해 전하고 싶은 이야기. 정확한 시기는 확인이 필요함.",
    transcript:
      "그 일이 아마 서른 즈음이었을 텐데, 정확히는 잘 모르겠어요. 그때 깨달은 건 천천히 가도 괜찮다는 거였어요.",
    tags: ["인생", "지혜"],
    visibility: "family",
    visibleToMemberIds: [],
    hasVoiceNote: false,
    unresolved: [{ field: "date", note: "정확한 시기가 확인이 필요해요" }],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    deletedAt: null,
    history: []
  };

  const m5: MemoryRecord = {
    id: "mem-5",
    recorderId: RECORDER_ID,
    category: "family",
    question: "가족과 함께 먹으면 생각나는 음식이 있나요?",
    title: "명절 아침 식탁",
    summary: "명절 아침마다 온 가족이 모여 먹던 식탁 풍경.",
    transcript:
      "명절 아침이면 온 가족이 다 모여서 전 부치는 냄새로 하루가 시작됐어요. 그 식탁이 참 그립습니다.",
    tags: ["명절", "가족"],
    visibility: "family",
    visibleToMemberIds: [],
    hasVoiceNote: false,
    unresolved: [],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    deletedAt: null,
    history: []
  };

  return [m1, m2, m3, m4, m5];
}

export function buildChapters(): BookChapter[] {
  return [
    { id: "ch-1", order: 1, title: "1장. 어린 시절과 고향", theme: "childhood" },
    { id: "ch-2", order: 2, title: "2장. 가족과 사랑", theme: "family" },
    { id: "ch-3", order: 3, title: "3장. 일과 성취", theme: "work" },
    { id: "ch-4", order: 4, title: "4장. 가치와 지혜", theme: "wisdom" }
  ];
}

export function buildPages(): BookPage[] {
  return [
    {
      id: "page-1",
      chapterId: "ch-1",
      order: 1,
      title: "방앗간 골목의 기억",
      body: "학교가 끝나면 나는 늘 방앗간 골목으로 향했다. 떡 찌는 냄새가 골목 가득 퍼져 있었고, 친구들과 고무줄놀이와 딱지치기를 하며 하루를 보냈다. 지금도 눈을 감으면 그 냄새가 떠오른다.",
      sourceMemoryIds: ["mem-1"],
      unresolved: [],
      status: "approved",
      visibility: "family",
      approvedAt: daysAgo(5),
      generatedAt: daysAgo(5)
    },
    {
      id: "page-2",
      chapterId: "ch-2",
      order: 1,
      title: "명절 아침의 온기",
      body: "명절 아침이면 온 가족이 다 모여 전 부치는 냄새로 하루가 시작되었다. 그 식탁이 지금도 그립다.",
      sourceMemoryIds: ["mem-5"],
      unresolved: [],
      status: "draft",
      visibility: "family",
      approvedAt: null,
      generatedAt: daysAgo(1)
    },
    {
      id: "page-3",
      chapterId: "ch-3",
      order: 1,
      title: "",
      body: "",
      sourceMemoryIds: [],
      unresolved: [],
      status: "insufficient",
      visibility: "family",
      approvedAt: null,
      generatedAt: null
    },
    {
      id: "page-4",
      chapterId: "ch-4",
      order: 1,
      title: "천천히 가도 괜찮다",
      body: "[확인 필요: 정확한 시기] 즈음, 나는 천천히 가도 괜찮다는 것을 깨달았다. 그 마음을 지금의 젊은 사람들에게도 전하고 싶다.",
      sourceMemoryIds: ["mem-4"],
      unresolved: [{ field: "date", note: "정확한 시기가 확인이 필요해요" }],
      status: "needs_review",
      visibility: "family",
      approvedAt: null,
      generatedAt: daysAgo(2)
    }
  ];
}

export function buildNewsItems(): FamilyNewsItem[] {
  return [
    {
      id: "news-1",
      authorId: FAMILY_ADMIN_ID,
      authorName: "이지영",
      relationship: "딸",
      type: "text",
      body: "엄마, 오늘 하늘이 정말 맑아요. 주말에 손주들과 같이 갈게요!",
      status: "broadcast",
      createdAt: daysAgo(1),
      episodeId: "ep-1"
    },
    {
      id: "news-2",
      authorId: FAMILY_MEMBER_ID,
      authorName: "이민준",
      relationship: "손자",
      type: "text",
      body: "할머니, 저 오늘 축구 경기에서 골 넣었어요. 다음에 영상 보여드릴게요.",
      status: "broadcast",
      createdAt: daysAgo(1),
      episodeId: "ep-1"
    },
    {
      id: "news-3",
      authorId: FAMILY_ADMIN_ID,
      authorName: "이지영",
      relationship: "딸",
      type: "photo",
      body: "지난 주말에 찍은 가족 사진이에요.",
      photoCaption: "민준이랑 같이 공원에서 찍었어요. 다들 활짝 웃고 있어요.",
      status: "scheduled",
      createdAt: daysAgo(0),
      episodeId: null
    }
  ];
}

export function buildEpisodes(): RadioEpisode[] {
  return [
    {
      id: "ep-1",
      dateLabel: "7월 27일 방송",
      status: "ready",
      title: "정순이네 가족 라디오",
      intro: "오늘은 새로운 소식 2개가 도착했어요. 함께 들어볼까요?",
      segments: [
        { id: "seg-1", newsItemId: "news-1", authorName: "이지영", relationship: "딸", text: "엄마, 오늘 하늘이 정말 맑아요. 주말에 손주들과 같이 갈게요!", order: 1 },
        { id: "seg-2", newsItemId: "news-2", authorName: "이민준", relationship: "손자", text: "할머니, 저 오늘 축구 경기에서 골 넣었어요. 다음에 영상 보여드릴게요.", order: 2 }
      ],
      createdAt: daysAgo(1),
      playedAt: daysAgo(1)
    }
  ];
}

export function buildInitialState(): AppState {
  return {
    onboardingComplete: false,
    activeViewerId: RECORDER_ID,
    family: buildFamily(),
    recorderProfile: buildRecorderProfile(),
    consent: { requiredAccepted: false, voiceProcessing: false, aiGeneration: false, familySharing: false, acceptedAt: null },
    schedule: {
      conversationTime: "09:00",
      radioTimes: ["08:00", "19:00"],
      timezone: "Asia/Seoul",
      notifyConversation: true,
      notifyRadio: true,
      autoplayRadio: false
    },
    accessibility: { fontScale: 1, highContrast: false, captionsAlways: true },
    memories: buildMemories(),
    chapters: buildChapters(),
    pages: buildPages(),
    newsItems: buildNewsItems(),
    episodes: buildEpisodes(),
    activeSession: null
  };
}
