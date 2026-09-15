import { useCallback, useEffect, useRef, useState } from "react";
import { PERSONAS } from "./types";
import type { SceneKey } from "./lib/scene";
import type { NewTaskInput } from "./lib/store";
import { boardActions, useBoard, useNow, useViewer } from "./lib/store";
import { Atmosphere } from "./components/Atmosphere";
import { TopBar } from "./components/TopBar";
import type { TabKey } from "./components/TopBar";
import { Dashboard } from "./screens/Dashboard";
import { CalendarScreen } from "./screens/CalendarScreen";

interface Toast {
  id: number;
  text: string;
}

export default function App() {
  const board = useBoard();
  const now = useNow(1000);
  const [viewer, setViewer] = useViewer();
  const [tab, setTab] = useState<TabKey>("board");
  const [preview, setPreview] = useState<SceneKey | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastSeq = useRef(0);

  const pushToast = useCallback((text: string) => {
    const id = (toastSeq.current += 1);
    setToasts((list) => [...list, { id, text }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  }, []);

  const handleAssign = useCallback(
    (input: NewTaskInput) => {
      const task = boardActions.assign(input);
      setPreview(null);
      pushToast(`${PERSONAS[task.assigneeId].name}의 두루마리에 새 일을 적었어요.`);
    },
    [pushToast]
  );

  const handleToggle = useCallback(
    (id: string) => {
      const task = board.tasks.find((t) => t.id === id);
      if (!task) return;
      setPreview(null);
      if (task.completedAt === null) {
        boardActions.complete(id);
        const remaining = board.tasks.filter((t) => t.completedAt === null && t.id !== id).length;
        pushToast(remaining === 0 ? "모두 해냈어요. 오늘의 두루마리가 텅 비었어요!" : "와아아앙!! 하나 해치웠다!");
      } else {
        boardActions.reopen(id);
        pushToast("다시 두루마리로 돌려놓았어요.");
      }
    },
    [board.tasks, pushToast]
  );

  const handleRemove = useCallback(
    (id: string) => {
      boardActions.remove(id);
      pushToast("두루마리에서 지웠어요.");
    },
    [pushToast]
  );

  const done = board.tasks.filter((t) => t.completedAt !== null).length;

  // 페이지 제목에 남은 일감 수를 얹어 둔다.
  useEffect(() => {
    const open = board.tasks.length - done;
    document.title = open > 0 ? `(${open}) 천리말랑 퀘스트보드` : "천리말랑 퀘스트보드";
  }, [board.tasks.length, done]);

  return (
    <>
      <Atmosphere />
      <div className="mq-app">
        <TopBar tab={tab} onTab={setTab} viewer={viewer} onViewer={setViewer} done={done} total={board.tasks.length} />

        <main className="mq-shell">
          {tab === "board" ? (
            <Dashboard
              board={board}
              now={now}
              viewer={viewer}
              preview={preview}
              onPreview={setPreview}
              onAssign={handleAssign}
              onToggle={handleToggle}
              onRemove={handleRemove}
            />
          ) : (
            <CalendarScreen board={board} now={now} />
          )}

          <footer className="mq-foot">
            <p>
              두 사람의 두루마리는 같은 브라우저 안에서 실시간으로 이어져요. 창을 두 개 띄우고 각각 백락정령·천리말랑이로
              두면 서로의 기록이 바로 반영됩니다.
            </p>
            <p style={{ marginTop: 10 }}>
              <button
                type="button"
                className="mq-btn mq-btn--ghost mq-btn--sm"
                onClick={() => {
                  boardActions.resetDemo();
                  setPreview(null);
                  pushToast("숲의 기록을 처음으로 되돌렸어요.");
                }}
              >
                ↺ 예시 기록으로 되돌리기
              </button>{" "}
              <button
                type="button"
                className="mq-btn mq-btn--ghost mq-btn--sm"
                onClick={() => {
                  boardActions.clearAll();
                  setPreview(null);
                  pushToast("두루마리를 모두 비웠어요.");
                }}
              >
                전부 비우기
              </button>
            </p>
          </footer>
        </main>
      </div>

      <div className="mq-toast-wrap" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className="mq-toast" key={t.id}>
            {t.text}
          </div>
        ))}
      </div>
    </>
  );
}
