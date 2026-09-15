import type { Task, UserId } from "../types";
import { PERSONAS } from "../types";
import { isLate, isOverdue, isPoking } from "../lib/scene";
import { clockLabel, countdownLabel, dueLabel, elapsedLabel } from "../lib/time";
import { pinStyle, subjectOf } from "../lib/persona";

interface TaskCardProps {
  task: Task;
  now: number;
  viewer: UserId;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

const URGENCY_LABEL: Record<Task["urgency"], string> = {
  soft: "천천히",
  normal: "보통",
  urgent: "급해요"
};

export function TaskCard({ task, now, viewer, onToggle, onRemove }: TaskCardProps) {
  const done = task.completedAt !== null;
  const overdue = isOverdue(task, now);
  const poking = !overdue && isPoking(task, now);
  const state = done ? "done" : overdue ? "overdue" : poking ? "poke" : "open";

  const canToggle = viewer === task.assigneeId;
  const canRemove = viewer === task.assignerId || viewer === task.assigneeId;
  const assignedByOther = task.assignerId !== task.assigneeId;

  return (
    <li className="mq-task" data-state={state} style={pinStyle(task.assigneeId)}>
      <div className="mq-task__row">
        <button
          type="button"
          className="mq-check"
          data-done={done}
          aria-pressed={done}
          disabled={!canToggle}
          title={
            canToggle
              ? done
                ? "다시 두루마리로 되돌리기"
                : "해냈다고 표시하기"
              : `${PERSONAS[task.assigneeId].name}만 완료할 수 있어요`
          }
          onClick={() => onToggle(task.id)}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8.6 6.3 12 13 4.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="mq-task__title">{task.title}</p>
          {task.note ? <p className="mq-task__note">{task.note}</p> : null}

          <div className="mq-task__meta">
            {assignedByOther ? (
              <span className="mq-chip mq-chip--gold">{subjectOf(task.assignerId)} 맡김</span>
            ) : (
              <span className="mq-chip">스스로 적은 일</span>
            )}

            {task.urgency !== "normal" ? (
              <span className={`mq-chip ${task.urgency === "urgent" ? "mq-chip--alarm" : "mq-chip--crystal"}`}>
                {URGENCY_LABEL[task.urgency]}
              </span>
            ) : null}

            {done ? (
              <>
                <span className="mq-chip mq-chip--leaf">{clockLabel(task.completedAt!)}에 완료</span>
                {isLate(task) ? <span className="mq-chip mq-chip--alarm">기한 초과</span> : null}
              </>
            ) : task.dueAt !== null ? (
              <span className={`mq-chip ${overdue ? "mq-chip--alarm" : "mq-chip--gold"}`}>
                {dueLabel(task.dueAt, now)} · {countdownLabel(task.dueAt, now)}
              </span>
            ) : (
              <span className="mq-chip">기한 없음</span>
            )}

            {!done ? <span className="mq-chip mq-chip--blush">{elapsedLabel(task.createdAt, now)}</span> : null}
          </div>
        </div>

        <div className="mq-task__tools">
          {canRemove ? (
            <button
              type="button"
              className="mq-icon-btn"
              title="두루마리에서 지우기"
              aria-label={`${task.title} 지우기`}
              onClick={() => onRemove(task.id)}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 4.5h10M6.5 4.5V3h3v1.5M5 4.5l.6 8h4.8l.6-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
