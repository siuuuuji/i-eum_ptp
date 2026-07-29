import { callGemini, type GeminiRequestBody } from "./_gemini.js";

interface VercelLikeRequest {
  method?: string;
  body?: unknown;
}

interface VercelLikeResponse {
  status(code: number): VercelLikeResponse;
  json(body: unknown): void;
  end(body?: string): void;
  setHeader(name: string, value: string): void;
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "허용되지 않은 방식이에요." });
    return;
  }

  let body: GeminiRequestBody;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body as GeminiRequestBody);
  } catch {
    res.status(400).json({ error: "요청 형식이 올바르지 않아요." });
    return;
  }

  const result = await callGemini(body);
  res.status(result.ok ? 200 : result.status).json(
    result.ok ? { text: result.text } : { error: result.error }
  );
}
