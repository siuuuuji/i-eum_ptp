import type { UserId } from "../types";
import { PERSONAS, USER_IDS } from "../types";
import { pinStyle } from "../lib/persona";

export type TabKey = "board" | "calendar";

interface TopBarProps {
  tab: TabKey;
  onTab: (tab: TabKey) => void;
  viewer: UserId;
  onViewer: (id: UserId) => void;
  done: number;
  total: number;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "board", label: "두루마리" },
  { key: "calendar", label: "여정 기록" }
];

export function TopBar({ tab, onTab, viewer, onViewer, done, total }: TopBarProps) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <header className="mq-top">
      <div className="mq-top__inner">
        <div className="mq-brand">
          <span className="mq-crest" aria-hidden="true">✦</span>
          <span>
            <span className="mq-brand__name">천리말랑 퀘스트보드</span>
            <br />
            <span className="mq-brand__sub">숲을 지키는 두 사람의 할 일</span>
          </span>
        </div>

        <nav className="mq-tabs" role="tablist" aria-label="화면 전환">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              className="mq-tab"
              aria-selected={tab === t.key}
              onClick={() => onTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mq-progress" title={`전체 ${total}개 중 ${done}개 완료`}>
          <span className="mq-ring" style={{ ["--p" as string]: pct }} aria-hidden="true">
            {pct}
          </span>
          <span className="mq-progress__text">
            오늘까지 <b>{done}</b> / {total}
            <br />
            숲의 일감
          </span>
        </div>

        <div className="mq-who">
          <span className="mq-who__label">보는 사람</span>
          {USER_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className="mq-whobtn"
              style={pinStyle(id)}
              aria-pressed={viewer === id}
              onClick={() => onViewer(id)}
            >
              <span className="mq-dot" aria-hidden="true" />
              {PERSONAS[id].name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
