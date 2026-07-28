export const uid = () => crypto.randomUUID();

export const nowIso = () => new Date().toISOString();

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(iso));
}

export function formatWeekdayLong(date = new Date()): string {
  return new Intl.DateTimeFormat("ko-KR", { weekday: "long", month: "long", day: "numeric" }).format(date);
}

export function daysBetween(fromIso: string, toIso = nowIso()): number {
  const diff = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
