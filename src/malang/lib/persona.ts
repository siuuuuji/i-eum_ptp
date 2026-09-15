import type { CSSProperties } from "react";
import type { UserId } from "../types";
import { PERSONAS } from "../types";

/** 인물별 강조색을 CSS 변수로 흘려보낸다. */
export function pinStyle(id: UserId): CSSProperties {
  const p = PERSONAS[id];
  return { "--pin": p.accent, "--pin-wash": p.accentSoft } as CSSProperties;
}

export function nameOf(id: UserId): string {
  return PERSONAS[id].name;
}

/** 한글 마지막 글자에 받침이 있는지 */
function hasFinalConsonant(word: string): boolean {
  const code = word.charCodeAt(word.length - 1);
  if (Number.isNaN(code) || code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

type JosaPair = "이가" | "을를" | "은는" | "과와" | "으로로";

const PAIRS: Record<JosaPair, [string, string]> = {
  이가: ["이", "가"],
  을를: ["을", "를"],
  은는: ["은", "는"],
  과와: ["과", "와"],
  으로로: ["으로", "로"]
};

/** 받침에 맞는 조사를 붙인다. 예) josa("천리말랑이", "이가") → "천리말랑이가" */
export function josa(word: string, pair: JosaPair): string {
  const [withBatchim, withoutBatchim] = PAIRS[pair];
  // '으로/로'는 ㄹ 받침일 때도 '로'를 쓴다.
  if (pair === "으로로") {
    const code = word.charCodeAt(word.length - 1);
    const isHangul = code >= 0xac00 && code <= 0xd7a3;
    const jong = isHangul ? (code - 0xac00) % 28 : 0;
    return word + (jong === 0 || jong === 8 ? withoutBatchim : withBatchim);
  }
  return word + (hasFinalConsonant(word) ? withBatchim : withoutBatchim);
}

/** "백락정령이" / "천리말랑이가" */
export function subjectOf(id: UserId): string {
  return josa(PERSONAS[id].name, "이가");
}

/** "백락정령을" / "천리말랑이를" */
export function objectOf(id: UserId): string {
  return josa(PERSONAS[id].name, "을를");
}

/** "백락정령은" / "천리말랑이는" */
export function topicOf(id: UserId): string {
  return josa(PERSONAS[id].name, "은는");
}

/** "백락정령에게" / "천리말랑이에게" — 받침과 무관 */
export function toOf(id: UserId): string {
  return `${PERSONAS[id].name}에게`;
}

/** "백락정령으로서" / "천리말랑이로서" */
export function asOf(id: UserId): string {
  return `${josa(PERSONAS[id].name, "으로로")}서`;
}
