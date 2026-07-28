import type { BookPage } from "../types";

export interface BookProgress {
  approved: number;
  draft: number;
}

/** 홈과 내 책 화면이 동일한 계산 규칙을 쓰도록 단일화한다 (BOOK-03). */
export function computeBookProgress(pages: BookPage[]): BookProgress {
  const approved = pages.filter((p) => p.status === "approved").length;
  const draft = pages.filter((p) => p.status === "draft" || p.status === "needs_review").length;
  return { approved, draft };
}
