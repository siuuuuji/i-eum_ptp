import { BookOpen, ChevronRight, Send } from "lucide-react";
import { useStore } from "../../state/store";
import { canViewMemory } from "../../lib/visibility";
import { computeBookProgress } from "../../lib/bookMath";
import { formatDate, formatWeekdayLong } from "../../lib/id";
import { EmptyState } from "../../components/common/EmptyState";

interface FamilyHomeProps {
  viewerId: string;
  onComposeNews: () => void;
  onOpenBook: () => void;
}

export function FamilyHome({ viewerId, onComposeNews, onOpenBook }: FamilyHomeProps) {
  const { state } = useStore();
  const visibleMemories = state.memories
    .filter((m) => !m.deletedAt && canViewMemory(m, viewerId, state.family))
    .slice(0, 3);
  const { approved } = computeBookProgress(state.pages);

  return (
    <section className="screen">
      <div className="greeting">
        <p>{formatWeekdayLong()}</p>
        <h1>
          {state.recorderProfile.displayName}님께
          <br />
          오늘의 소식을 들려주세요.
        </h1>
      </div>

      <article className="card">
        <div className="card-label">소식 보내기</div>
        <p className="helper-text" style={{ marginTop: 6 }}>짧게 적거나 직접 목소리로 남길 수 있어요.</p>
        <button className="btn btn-accent btn-lg" style={{ marginTop: 12 }} onClick={onComposeNews}>
          <Send size={20} /> 소식 보내기
        </button>
      </article>

      <button className="card" style={{ width: "100%", textAlign: "left", marginTop: 14 }} onClick={onOpenBook}>
        <div className="card-label">자서전 진행률</div>
        <p style={{ margin: "10px 0 0", fontSize: "0.92rem" }}>
          지금까지 <strong>완성 {approved}쪽</strong>이 만들어졌어요.
        </p>
      </button>

      <div className="page-title" style={{ marginTop: 22 }}>
        <small>RECENT</small>
        <h1 style={{ fontSize: "1.15rem" }}>최근 공개된 기억</h1>
      </div>
      {visibleMemories.length ? (
        <div className="list-grid">
          {visibleMemories.map((m) => (
            <article className="list-item" key={m.id}>
              <div className="list-item-date">{formatDate(m.createdAt)}</div>
              <h3>{m.title}</h3>
              <p>{m.summary}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen />}
          title="아직 공개된 기억이 없어요"
          description="기록자가 기억을 저장하고 공개하면 여기에 보여요."
        />
      )}
      <button className="btn btn-ghost" style={{ marginTop: 6 }} onClick={onOpenBook}>
        전체 보기 <ChevronRight size={16} />
      </button>
    </section>
  );
}
