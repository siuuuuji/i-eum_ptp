import type { BookPage, FamilyGroup, MemoryRecord } from "../types";

export function isRecorderViewer(viewerId: string, family: FamilyGroup): boolean {
  return viewerId === family.recorderId;
}

export function canViewMemory(memory: MemoryRecord, viewerId: string, family: FamilyGroup): boolean {
  if (isRecorderViewer(viewerId, family)) return true;
  if (memory.deletedAt) return false;
  if (memory.visibility === "private") return false;
  if (memory.visibility === "family") return true;
  return memory.visibleToMemberIds.includes(viewerId);
}

/** 여러 기억을 합친 페이지는 가장 제한적인 원본 기록 권한을 상속한다 (BOOK-06). */
export function canViewPage(
  page: BookPage,
  viewerId: string,
  family: FamilyGroup,
  memories: MemoryRecord[]
): boolean {
  if (isRecorderViewer(viewerId, family)) return true;
  if (page.status !== "approved") return false;
  const sourceMemories = memories.filter((m) => page.sourceMemoryIds.includes(m.id));
  if (sourceMemories.length === 0) return page.visibility === "family";
  return sourceMemories.every((m) => canViewMemory(m, viewerId, family));
}

export function visibilityLabel(visibility: MemoryRecord["visibility"]): string {
  if (visibility === "private") return "나만 보기";
  if (visibility === "custom") return "선택한 가족";
  return "가족 전체 공개";
}
