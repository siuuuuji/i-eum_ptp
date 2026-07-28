import type { PageStatus } from "../../types";

const LABEL: Record<PageStatus, string> = {
  insufficient: "재료 부족",
  draft: "초안",
  needs_review: "확인 필요",
  approved: "완성"
};

const CLASS: Record<PageStatus, string> = {
  insufficient: "pending",
  draft: "draft",
  needs_review: "review",
  approved: "done"
};

export function PageStatePill({ status }: { status: PageStatus }) {
  return <span className={`state-pill ${CLASS[status]}`}>{LABEL[status]}</span>;
}
