import { ChevronRight, Mic, Radio } from "lucide-react";
import { useStore } from "../../state/store";
import { computeBookProgress } from "../../lib/bookMath";
import { formatWeekdayLong } from "../../lib/id";
import { pickDailyCategory, pickMainQuestion } from "../../data/questions";
import { Mascot } from "../../components/common/Mascot";

interface RecorderHomeProps {
  onStartConversation: () => void;
  onOpenRadio: () => void;
  onOpenBook: () => void;
}

export function RecorderHome({ onStartConversation, onOpenRadio, onOpenBook }: RecorderHomeProps) {
  const { state } = useStore();
  const { approved, draft } = computeBookProgress(state.pages);

  const dayIndex = new Date().getDate();
  const category = pickDailyCategory(dayIndex);
  const question = pickMainQuestion(category, dayIndex);

  const readyEpisode = state.episodes.find((e) => e.status === "ready" && !e.playedAt);
  const nextRadioTime = state.schedule.radioTimes[0] ?? null;
  const pendingNews = state.newsItems.filter((n) => n.status === "scheduled").length;

  return (
    <section className="screen">
      <div className="greeting">
        <p>{formatWeekdayLong()}</p>
        <h1>
          {state.recorderProfile.displayName}님,
          <br />
          오늘도 이야기를 들려주세요.
        </h1>
      </div>

      <article className="card">
        <div className="card-label">
          <Mic size={18} /> 오늘의 기억 질문 · {category.label}
        </div>
        <h2 style={{ font: "700 1.25rem/1.5 'Gowun Batang', serif", margin: "12px 0 18px" }}>{question}</h2>
        <button className="btn btn-primary btn-lg" onClick={onStartConversation}>
          <Mascot mood="calm" size={26} /> 이야기 시작
        </button>
        <p className="helper-text" style={{ marginTop: 10 }}>
          편하게 말씀하시면 제가 정리해 드릴게요.
        </p>
      </article>

      <button className="card" style={{ width: "100%", textAlign: "left", marginTop: 14 }} onClick={onOpenBook}>
        <div className="card-label">나의 자서전</div>
        <div className="progress-card">
          <div className="progress-row">
            <span>완성 {approved}쪽 · 초안 {draft}쪽</span>
            <ChevronRight size={18} />
          </div>
          <div className="progress-track">
            <span className="fill-approved" style={{ width: `${Math.min(100, approved * 12)}%` }} />
            <span className="fill-draft" style={{ width: `${Math.min(100 - approved * 12, draft * 10)}%` }} />
          </div>
          <div className="progress-legend">
            <span>
              <i className="i-approved" /> 완성
            </span>
            <span>
              <i className="i-draft" /> 초안(승인 전)
            </span>
          </div>
        </div>
      </button>

      <button className="card" style={{ width: "100%", textAlign: "left", marginTop: 14, display: "flex", alignItems: "center", gap: 14 }} onClick={onOpenRadio}>
        <span style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--forest-tint)", display: "grid", placeItems: "center", color: "var(--forest)" }}>
          <Radio />
        </span>
        <span style={{ flex: 1 }}>
          <small style={{ display: "block", color: "var(--muted)", fontSize: "0.74rem" }}>가족 라디오</small>
          <strong style={{ fontSize: "0.92rem" }}>
            {readyEpisode
              ? "지금 재생할 수 있어요"
              : nextRadioTime
                ? `다음 방송 ${nextRadioTime} 예정${pendingNews ? ` · 대기 중 ${pendingNews}건` : ""}`
                : "예정된 방송이 없어요"}
          </strong>
        </span>
        <ChevronRight />
      </button>
    </section>
  );
}
