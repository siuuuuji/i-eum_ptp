import type { Task, UserId } from "../types";
import { PERSONAS } from "../types";
import { isOverdue } from "../lib/scene";
import { pinStyle } from "../lib/persona";
import { TaskCard } from "./TaskCard";

interface TaskColumnProps {
  owner: UserId;
  tasks: Task[];
  now: number;
  viewer: UserId;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

const EMPTY_COPY: Record<UserId, string> = {
  baekrak: "백락정령의 두루마리는 비어 있어요.\n숲을 돌아볼 일을 적어 두세요.",
  mallang: "천리말랑이에게 맡긴 일이 없어요.\n오늘은 마음껏 말랑거려도 좋아요."
};

export function TaskColumn({ owner, tasks, now, viewer, onToggle, onRemove }: TaskColumnProps) {
  const persona = PERSONAS[owner];
  const open = tasks.filter((t) => t.completedAt === null);
  const done = tasks.filter((t) => t.completedAt !== null);
  const overdueCount = open.filter((t) => isOverdue(t, now)).length;

  const sortedOpen = [...open].sort((a, b) => {
    const aOver = isOverdue(a, now) ? 0 : 1;
    const bOver = isOverdue(b, now) ? 0 : 1;
    if (aOver !== bOver) return aOver - bOver;
    const aDue = a.dueAt ?? Number.MAX_SAFE_INTEGER;
    const bDue = b.dueAt ?? Number.MAX_SAFE_INTEGER;
    if (aDue !== bDue) return aDue - bDue;
    return b.createdAt - a.createdAt;
  });

  const sortedDone = [...done].sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

  return (
    <section className="mq-panel mq-col" style={pinStyle(owner)} aria-label={`${persona.name}의 두루마리`}>
      <header className="mq-col__head">
        <span className="mq-sigil" aria-hidden="true">{persona.sigil}</span>
        <span>
          <span className="mq-col__name">{persona.name}</span>
          <br />
          <span className="mq-col__role">{persona.title}</span>
        </span>
        <span className="mq-col__count">
          <b>
            {done.length}
            <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>/{tasks.length}</span>
          </b>
          {overdueCount > 0 ? `기한 넘김 ${overdueCount}` : "해낸 일"}
        </span>
      </header>

      {sortedOpen.length === 0 && sortedDone.length === 0 ? (
        <p className="mq-empty" style={{ whiteSpace: "pre-line" }}>
          {EMPTY_COPY[owner]}
        </p>
      ) : null}

      {sortedOpen.length > 0 ? (
        <ul className="mq-list">
          {sortedOpen.map((task) => (
            <TaskCard key={task.id} task={task} now={now} viewer={viewer} onToggle={onToggle} onRemove={onRemove} />
          ))}
        </ul>
      ) : sortedDone.length > 0 ? (
        <p className="mq-empty">남은 일이 없어요. 두루마리가 텅 비었어요.</p>
      ) : null}

      {sortedDone.length > 0 ? (
        <>
          <p className="mq-divider">해낸 일 {sortedDone.length}</p>
          <ul className="mq-list">
            {sortedDone.map((task) => (
              <TaskCard key={task.id} task={task} now={now} viewer={viewer} onToggle={onToggle} onRemove={onRemove} />
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
