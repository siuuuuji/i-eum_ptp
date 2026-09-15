import { useState } from "react";
import type { FormEvent } from "react";
import type { Urgency, UserId } from "../types";
import { PERSONAS, USER_IDS } from "../types";
import { HOUR, MINUTE, fromLocalInput, startOfDay, toLocalInput } from "../lib/time";
import { asOf, pinStyle, toOf } from "../lib/persona";
import type { NewTaskInput } from "../lib/store";

interface ComposerProps {
  viewer: UserId;
  onAssign: (input: NewTaskInput) => void;
}

const URGENCIES: { key: Urgency; label: string }[] = [
  { key: "soft", label: "천천히" },
  { key: "normal", label: "보통" },
  { key: "urgent", label: "급해요" }
];

export function Composer({ viewer, onAssign }: ComposerProps) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [assignee, setAssignee] = useState<UserId>("mallang");
  const [due, setDue] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("normal");

  const canSubmit = title.trim().length > 0;

  function setQuickDue(ms: number) {
    setDue(toLocalInput(Date.now() + ms));
  }

  function setTonight(hour: number, dayOffset = 0) {
    const base = startOfDay(Date.now()) + dayOffset * 24 * HOUR + hour * HOUR;
    setDue(toLocalInput(base));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    onAssign({
      title,
      note,
      assignerId: viewer,
      assigneeId: assignee,
      dueAt: fromLocalInput(due),
      urgency
    });
    setTitle("");
    setNote("");
    setDue("");
    setUrgency("normal");
  }

  return (
    <form className="mq-panel mq-compose" onSubmit={submit}>
      <div className="mq-compose__head">
        <span className="mq-crest" aria-hidden="true">✎</span>
        <span>
          <span className="mq-compose__title">새로운 일 맡기기</span>
          <br />
          <span className="mq-col__role">
            {asOf(viewer)} {toOf(assignee)} 맡깁니다
          </span>
        </span>
        <span className="mq-progress__text" style={{ marginLeft: "auto" }}>
          기한을 정해 두면 넘겼을 때
          <br />
          말랑이의 볼이 눌려요.
        </span>
      </div>

      <div className="mq-compose__grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label className="mq-field">
            <span className="mq-field__label">할 일</span>
            <input
              className="mq-input"
              value={title}
              maxLength={80}
              placeholder="예) 숲 동쪽 울타리 살펴보기"
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="mq-field">
            <span className="mq-field__label">덧붙이는 말</span>
            <textarea
              className="mq-textarea"
              value={note}
              maxLength={200}
              placeholder="어디서, 어떻게 하면 좋을지 적어 두세요."
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>

        <div className="mq-compose__side">
          <div className="mq-field">
            <span className="mq-field__label">맡을 사람</span>
            <div className="mq-seg">
              {USER_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  style={pinStyle(id)}
                  aria-pressed={assignee === id}
                  onClick={() => setAssignee(id)}
                >
                  {PERSONAS[id].name}
                </button>
              ))}
            </div>
          </div>

          <label className="mq-field">
            <span className="mq-field__label">기한</span>
            <input className="mq-input" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>

          <div className="mq-quick">
            <button type="button" onClick={() => setQuickDue(30 * MINUTE)}>30분 뒤</button>
            <button type="button" onClick={() => setQuickDue(2 * HOUR)}>2시간 뒤</button>
            <button type="button" onClick={() => setTonight(21)}>오늘 밤 9시</button>
            <button type="button" onClick={() => setTonight(12, 1)}>내일 정오</button>
            <button type="button" onClick={() => setDue("")}>기한 없음</button>
          </div>

          <div className="mq-field">
            <span className="mq-field__label">서두름</span>
            <div className="mq-seg">
              {URGENCIES.map((u) => (
                <button key={u.key} type="button" aria-pressed={urgency === u.key} onClick={() => setUrgency(u.key)}>
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mq-compose__foot">
        <button type="submit" className={`mq-btn ${assignee === "mallang" ? "mq-btn--blush" : ""}`} disabled={!canSubmit}>
          ✦ {PERSONAS[assignee].name}에게 맡기기
        </button>
        <span className="mq-progress__text">
          맡긴 지 1시간이 지나면 백락정령이 콕콕 찌르러 옵니다.
        </span>
      </div>
    </form>
  );
}
