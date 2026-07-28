import type { UnresolvedItem } from "../types";

export type GeminiOutcome<T> = { ok: true; data: T } | { ok: false; error: string };

interface RawContent {
  role: "user" | "model";
  parts: { text: string }[];
}

async function askGemini(params: {
  systemInstruction: string;
  contents: RawContent[];
  json?: boolean;
  temperature?: number;
}): Promise<GeminiOutcome<string>> {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: params.systemInstruction,
        contents: params.contents,
        temperature: params.temperature ?? 0.6,
        responseMimeType: params.json ? "application/json" : "text/plain"
      })
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      return { ok: false, error: json?.error || "AI 생성에 실패했어요." };
    }
    return { ok: true, data: json.text as string };
  } catch {
    return { ok: false, error: "AI 서버에 연결하지 못했어요. 네트워크를 확인해 주세요." };
  }
}

function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced ? fenced[1].trim() : trimmed;
}

const CONVERSATION_SYSTEM_PROMPT = `당신은 이음의 기억 대화 파트너다.
목표는 사용자가 편안하게 삶의 경험을 말하도록 돕고, 기록 가치가 있는 사실·감정·장면을 정리하는 것이다.
한 번에 질문 하나만 하고 존댓말을 사용한다. 답을 평가하거나 기억을 교정하지 않는다.
이름·날짜·장소를 확신할 수 없으면 추정하지 말고 확인 질문을 하거나 '확인 필요'로 남긴다.
사용자가 멈추고 싶어 하거나 불편함을 표현하면 즉시 주제를 바꾸거나 세션을 끝낸다.
의료 진단·치료 조언을 하지 않으며, 기존 가족 사실을 새로 만들어 내지 않는다.
슬픔·상실·트라우마가 나타나면 깊이 파고들지 않고 멈춤·주제 변경을 제안한다.
응답은 한두 문장으로 짧게 한다.`;

export interface ConversationTurnInput {
  speaker: "ai" | "user";
  text: string;
}

export async function converseReply(
  turns: ConversationTurnInput[],
  category: string
): Promise<GeminiOutcome<string>> {
  const contents: RawContent[] = turns.map((t) => ({
    role: t.speaker === "ai" ? "model" : "user",
    parts: [{ text: t.text }]
  }));
  return askGemini({
    systemInstruction: `${CONVERSATION_SYSTEM_PROMPT}\n지금 대화 주제 범주는 '${category}'다.`,
    contents,
    temperature: 0.7
  });
}

export interface MemorySummaryResult {
  title: string;
  summary: string;
  tags: string[];
  unresolved: UnresolvedItem[];
}

export async function summarizeMemory(
  transcript: string,
  question: string
): Promise<GeminiOutcome<MemorySummaryResult>> {
  const outcome = await askGemini({
    systemInstruction: `${CONVERSATION_SYSTEM_PROMPT}
지금부터는 대화가 끝난 뒤 기록을 정리하는 역할이다.
아래 JSON 형식으로만 답한다. 다른 텍스트는 포함하지 않는다.
{"title": "12자 이내 제목", "summary": "1~2문장 요약", "tags": ["태그", "..."], "unresolved": [{"field": "name|date|place", "note": "무엇이 확인이 필요한지"}]}
이름·날짜·장소가 불확실하면 지어내지 말고 unresolved에 넣는다. 확실하면 unresolved는 빈 배열로 한다.`,
    contents: [{ role: "user", parts: [{ text: `질문: ${question}\n답변 원문: ${transcript}` }] }],
    json: true,
    temperature: 0.4
  });
  if (!outcome.ok) return outcome;
  try {
    const parsed = JSON.parse(stripJsonFence(outcome.data)) as MemorySummaryResult;
    return {
      ok: true,
      data: {
        title: parsed.title || question.slice(0, 16),
        summary: parsed.summary || "",
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        unresolved: Array.isArray(parsed.unresolved) ? parsed.unresolved : []
      }
    };
  } catch {
    return { ok: false, error: "AI 응답을 정리하지 못했어요." };
  }
}

const BOOK_SYSTEM_PROMPT = `제공된 기억 기록만 근거로 한국어 1인칭 자서전 초안을 작성한다.
새로운 사건, 감정, 인물, 날짜를 창작하지 않는다.
불확실한 고유명사와 시점은 [확인 필요: ...]로 표시한다.
원문의 말투와 의미를 존중하되 문장 연결만 자연스럽게 다듬는다.
아래 JSON 형식으로만 답한다. 다른 텍스트는 포함하지 않는다.
{"title": "페이지 제목", "body": "본문 (필요하면 [확인 필요: ...] 포함)", "unresolved": [{"field": "name|date|place", "note": "설명"}]}`;

export interface BookDraftResult {
  title: string;
  body: string;
  unresolved: UnresolvedItem[];
}

export async function draftBookPage(
  memories: { id: string; title: string; transcript: string }[]
): Promise<GeminiOutcome<BookDraftResult>> {
  const material = memories.map((m, i) => `[기록 ${i + 1} · id:${m.id}] ${m.title}\n${m.transcript}`).join("\n\n");
  const outcome = await askGemini({
    systemInstruction: BOOK_SYSTEM_PROMPT,
    contents: [{ role: "user", parts: [{ text: material }] }],
    json: true,
    temperature: 0.5
  });
  if (!outcome.ok) return outcome;
  try {
    const parsed = JSON.parse(stripJsonFence(outcome.data)) as BookDraftResult;
    return {
      ok: true,
      data: {
        title: parsed.title || "",
        body: parsed.body || "",
        unresolved: Array.isArray(parsed.unresolved) ? parsed.unresolved : []
      }
    };
  } catch {
    return { ok: false, error: "자서전 초안을 만들지 못했어요." };
  }
}

const RADIO_SYSTEM_PROMPT = `당신은 이음 가족 라디오의 진행자다.
입력된 가족 소식을 순서대로 짧고 따뜻하게 연결하되 어떤 사실도 추가하지 않는다.
보낸 사람의 관계와 이름을 정확히 소개한다. 불명확한 발음은 추정하지 않는다.
아래 JSON 형식으로만 답한다. 다른 텍스트는 포함하지 않는다.
{"title": "방송 제목", "intro": "진행 멘트 1~2문장", "segments": [{"newsItemId": "id", "text": "소식을 자연스럽게 소개하는 문장"}]}`;

export interface RadioDraftSegment {
  newsItemId: string;
  text: string;
}

export interface RadioDraftResult {
  title: string;
  intro: string;
  segments: RadioDraftSegment[];
}

export async function draftRadioEpisode(
  items: { id: string; authorName: string; relationship: string; body: string }[]
): Promise<GeminiOutcome<RadioDraftResult>> {
  const material = items
    .map((n) => `[id:${n.id}] ${n.relationship} ${n.authorName}: ${n.body}`)
    .join("\n");
  const outcome = await askGemini({
    systemInstruction: RADIO_SYSTEM_PROMPT,
    contents: [{ role: "user", parts: [{ text: material }] }],
    json: true,
    temperature: 0.6
  });
  if (!outcome.ok) return outcome;
  try {
    const parsed = JSON.parse(stripJsonFence(outcome.data)) as RadioDraftResult;
    return {
      ok: true,
      data: {
        title: parsed.title || "가족 라디오",
        intro: parsed.intro || "",
        segments: Array.isArray(parsed.segments) ? parsed.segments : []
      }
    };
  } catch {
    return { ok: false, error: "라디오 방송을 만들지 못했어요." };
  }
}
