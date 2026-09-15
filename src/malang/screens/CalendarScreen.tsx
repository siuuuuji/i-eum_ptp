import { useMemo, useState } from "react";
import type { BoardState, Task, UserId } from "../types";
import { PERSONAS, USER_IDS } from "../types";
import { ART_FOCAL, JOURNEY_ALT, JOURNEY_IMAGE, isLate } from "../lib/scene";
import { pinStyle } from "../lib/persona";
import {
  addDays,
  clockLabel,
  isSameDay,
  startOfDay,
  startOfWeek,
  weekDays,
  weekRangeLabel,
  weekdayLabel
} from "../lib/time";
import { RefArt } from "../components/RefArt";

/** 한 주에 이만큼 해내면 '상위 1%의 성'에 한 걸음 더 가까워진다. */
const WEEKLY_GOAL = 12;

interface CalendarScreenProps {
  board: BoardState;
  now: number;
}

export function CalendarScreen({ board, now }: CalendarScreenProps) {
  const [offset, setOffset] = useState(0);
  const weekStart = useMemo(() => addDays(startOfWeek(now), offset * 7), [now, offset]);
  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const weekEnd = addDays(weekStart, 7);

  const completedThisWeek = board.tasks.filter(
    (t) => t.completedAt !== null && t.completedAt >= weekStart && t.completedAt < weekEnd
  );

  const missedThisWeek = board.tasks.filter(
    (t) =>
      t.completedAt === null &&
      t.dueAt !== null &&
      t.dueAt >= weekStart &&
      t.dueAt < weekEnd &&
      now > t.dueAt
  );

  const perUser = (id: UserId) => completedThisWeek.filter((t) => t.assigneeId === id).length;
  const onTime = completedThisWeek.filter((t) => !isLate(t)).length;
  const onTimeRate = completedThisWeek.length === 0 ? 0 : Math.round((onTime / completedThisWeek.length) * 100);
  const goalPct = Math.min(100, Math.round((completedThisWeek.length / WEEKLY_GOAL) * 100));

  return (
    <div className="mq-cal">
      <section className="mq-cal__hero" aria-label="여정의 기록">
        <div className="mq-stage__art">
          <div className="mq-stage__layer" data-active="true">
            <RefArt src={JOURNEY_IMAGE} alt={JOURNEY_ALT} focal={ART_FOCAL[JOURNEY_IMAGE]} opacity={0.9} eager />
          </div>
        </div>
        <div className="mq-stage__scrim" aria-hidden="true" />
        <div className="mq-cal__herobody">
          <p className="mq-cal__quote">
            더 멀리, 더 높이.
            <br />
            우리의 모험은 이제부터야.
          </p>
          <span className="mq-cal__sign">상위 1%의 성 →</span>
        </div>
      </section>

      <div className="mq-panel mq-cal__nav">
        <button type="button" className="mq-btn mq-btn--ghost mq-btn--sm" onClick={() => setOffset((o) => o - 1)}>
          ← 지난주
        </button>
        <span className="mq-cal__range">{weekRangeLabel(weekStart)}</span>
        {offset !== 0 ? (
          <button type="button" className="mq-btn mq-btn--ghost mq-btn--sm" onClick={() => setOffset(0)}>
            이번 주로
          </button>
        ) : (
          <span className="mq-chip mq-chip--gold">이번 주</span>
        )}
        <button type="button" className="mq-btn mq-btn--ghost mq-btn--sm" onClick={() => setOffset((o) => o + 1)}>
          다음주 →
        </button>
        <span className="mq-cal__navspacer" />
        <span className="mq-cal__legend">
          {USER_IDS.map((id) => (
            <span key={id} className="mq-chip" style={pinStyle(id)}>
              <span className="mq-dot" aria-hidden="true" />
              {PERSONAS[id].name} {perUser(id)}개
            </span>
          ))}
        </span>
      </div>

      <div className="mq-week">
        {days.map((day) => (
          <DayCell key={day} day={day} now={now} tasks={board.tasks} />
        ))}
      </div>

      <section className="mq-panel mq-summary" aria-label="이번 주 요약">
        <div className="mq-stat">
          <span className="mq-stat__k">해낸 일</span>
          <span className="mq-stat__v">
            {completedThisWeek.length}
            <small>개</small>
          </span>
          <span className="mq-stat__bar">
            <span className="mq-stat__fill" style={{ width: `${goalPct}%` }} />
          </span>
          <span className="mq-progress__text">
            이번 주 목표 {WEEKLY_GOAL}개 중 {goalPct}% — 성까지 한 걸음
          </span>
        </div>

        {USER_IDS.map((id) => {
          const count = perUser(id);
          const pct = completedThisWeek.length === 0 ? 0 : Math.round((count / completedThisWeek.length) * 100);
          return (
            <div className="mq-stat" key={id}>
              <span className="mq-stat__k">{PERSONAS[id].name}</span>
              <span className="mq-stat__v">
                {count}
                <small>개</small>
              </span>
              <span className="mq-stat__bar">
                <span className="mq-stat__fill" data-tone={id === "mallang" ? "blush" : undefined} style={{ width: `${pct}%` }} />
              </span>
              <span className="mq-progress__text">{PERSONAS[id].title}</span>
            </div>
          );
        })}

        <div className="mq-stat">
          <span className="mq-stat__k">기한 안에 끝낸 비율</span>
          <span className="mq-stat__v">
            {onTimeRate}
            <small>%</small>
          </span>
          <span className="mq-stat__bar">
            <span className="mq-stat__fill" style={{ width: `${onTimeRate}%` }} />
          </span>
          <span className="mq-progress__text">
            {missedThisWeek.length > 0 ? `아직 못 지킨 약속 ${missedThisWeek.length}개` : "놓친 약속이 없어요"}
          </span>
        </div>
      </section>
    </div>
  );
}

interface DayCellProps {
  day: number;
  now: number;
  tasks: Task[];
}

function DayCell({ day, now, tasks }: DayCellProps) {
  const nextDay = addDays(day, 1);
  const dow = new Date(day).getDay();

  const done = tasks
    .filter((t) => t.completedAt !== null && t.completedAt >= day && t.completedAt < nextDay)
    .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0));

  const missed = tasks.filter(
    (t) => t.completedAt === null && t.dueAt !== null && t.dueAt >= day && t.dueAt < nextDay && now > t.dueAt
  );

  return (
    <div
      className="mq-panel mq-day"
      data-today={isSameDay(day, now)}
      data-weekend={dow === 0 || dow === 6}
      data-future={day > startOfDay(now)}
    >
      <div className="mq-day__head">
        <span className="mq-day__dow">{weekdayLabel(day)}</span>
        <span className="mq-day__num">{new Date(day).getDate()}</span>
      </div>

      {done.length === 0 && missed.length === 0 ? (
        <p className="mq-day__empty">{day > startOfDay(now) ? "아직 오지 않은 날" : "기록 없음"}</p>
      ) : (
        <ul className="mq-day__list">
          {done.map((t) => (
            <li className="mq-done" key={t.id} style={pinStyle(t.assigneeId)}>
              <span className="mq-done__who">
                {PERSONAS[t.assigneeId].sigil} {PERSONAS[t.assigneeId].name} · {clockLabel(t.completedAt!)}
              </span>
              {t.title}
              {isLate(t) ? <span className="mq-done__late">기한을 넘겨 완료</span> : null}
            </li>
          ))}
          {missed.map((t) => (
            <li className="mq-done" key={t.id} style={{ ["--pin" as string]: "#c96b6b", opacity: 0.85 }}>
              <span className="mq-done__who">
                ✗ {PERSONAS[t.assigneeId].name} · 기한 {clockLabel(t.dueAt!)}
              </span>
              {t.title}
              <span className="mq-done__late">아직 못 끝냈어요</span>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 ? (
        <div className="mq-day__tally" aria-hidden="true">
          {done.map((t) => (
            <span className="mq-pip" key={t.id} style={pinStyle(t.assigneeId)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
