export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** 과제를 등록하고 이만큼 지나면 "콕콕" 장면이 열린다. */
export const POKE_AFTER = HOUR;

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** 월요일을 한 주의 시작으로 본다. */
export function startOfWeek(ts: number): number {
  const d = new Date(startOfDay(ts));
  const shift = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - shift);
  return d.getTime();
}

export function addDays(ts: number, days: number): number {
  const d = new Date(ts);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export function weekDays(weekStart: number): number[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function isSameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b);
}

export function weekdayLabel(ts: number): string {
  return WEEKDAYS[new Date(ts).getDay()];
}

export function dayLabel(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

export function monthDayLabel(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function weekRangeLabel(weekStart: number): string {
  const end = addDays(weekStart, 6);
  const s = new Date(weekStart);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth();
  const head = `${s.getFullYear()}년 ${s.getMonth() + 1}월 ${s.getDate()}일`;
  const tail = sameMonth ? `${e.getDate()}일` : `${e.getMonth() + 1}월 ${e.getDate()}일`;
  return `${head} – ${tail}`;
}

export function clockLabel(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${h12}:${m}`;
}

/** 24시간 이내면 시각만, 그 밖이면 날짜까지 */
export function dueLabel(dueAt: number, now: number): string {
  if (Math.abs(dueAt - now) < DAY && isSameDay(dueAt, now)) return `오늘 ${clockLabel(dueAt)}`;
  if (isSameDay(dueAt, addDays(now, 1))) return `내일 ${clockLabel(dueAt)}`;
  return `${dayLabel(dueAt)} ${clockLabel(dueAt)}`;
}

function chunks(ms: number): string {
  const totalMin = Math.floor(ms / MINUTE);
  const d = Math.floor(totalMin / (60 * 24));
  const h = Math.floor((totalMin % (60 * 24)) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}일 ${h}시간`;
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

/** 기한까지 남은 시간 / 지난 시간 */
export function countdownLabel(dueAt: number, now: number): string {
  const diff = dueAt - now;
  if (diff <= 0) return `${chunks(-diff)} 지났어요`;
  if (diff < MINUTE) return "곧 마감이에요";
  return `${chunks(diff)} 남았어요`;
}

export function elapsedLabel(from: number, now: number): string {
  const diff = Math.max(0, now - from);
  if (diff < MINUTE) return "방금 맡겨졌어요";
  return `맡겨진 지 ${chunks(diff)}`;
}

/** datetime-local 입력값 <-> timestamp */
export function toLocalInput(ts: number): string {
  const d = new Date(ts - d0(ts));
  return d.toISOString().slice(0, 16);
}

function d0(ts: number): number {
  return new Date(ts).getTimezoneOffset() * MINUTE;
}

export function fromLocalInput(value: string): number | null {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}
