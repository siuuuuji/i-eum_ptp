// 서버 전용 모듈. GEMINI_API_KEY는 여기서만 읽고 클라이언트로 절대 전달하지 않는다.
export interface GeminiPart {
  text: string;
}

export interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

export interface GeminiRequestBody {
  systemInstruction?: string;
  contents: GeminiContent[];
  temperature?: number;
  responseMimeType?: "text/plain" | "application/json";
}

export interface GeminiResult {
  ok: boolean;
  status: number;
  text?: string;
  error?: string;
}

const DEFAULT_MODEL = "gemini-flash-latest";

export async function callGemini(body: GeminiRequestBody): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, status: 500, error: "서버에 GEMINI_API_KEY가 설정되어 있지 않아요." };
  }
  if (!Array.isArray(body?.contents) || body.contents.length === 0) {
    return { ok: false, status: 400, error: "대화 내용이 비어 있어요." };
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload: Record<string, unknown> = {
    contents: body.contents,
    generationConfig: {
      temperature: body.temperature ?? 0.6,
      ...(body.responseMimeType ? { responseMimeType: body.responseMimeType } : {})
    }
  };
  if (body.systemInstruction) {
    payload.systemInstruction = { parts: [{ text: body.systemInstruction }] };
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    return { ok: false, status: 502, error: "AI 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    return { ok: false, status: 502, error: "AI 응답을 읽지 못했어요." };
  }

  if (!res.ok) {
    return { ok: false, status: res.status, error: json?.error?.message || "AI 응답 생성에 실패했어요." };
  }

  const candidate = json?.candidates?.[0];
  const finishReason = candidate?.finishReason;
  const text: string = (candidate?.content?.parts || [])
    .map((p: GeminiPart) => p?.text || "")
    .join("");

  if (!text) {
    if (finishReason === "SAFETY") {
      return { ok: false, status: 422, error: "안전 정책으로 응답이 차단됐어요." };
    }
    return { ok: false, status: 502, error: "AI가 빈 응답을 반환했어요." };
  }

  return { ok: true, status: 200, text };
}
