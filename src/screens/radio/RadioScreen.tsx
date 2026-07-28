import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Radio as RadioIcon, Send, X } from "lucide-react";
import { useStore } from "../../state/store";
import { useToast } from "../../components/common/Toast";
import { EmptyState } from "../../components/common/EmptyState";
import { ConfirmSheet } from "../../components/common/ConfirmSheet";
import { draftRadioEpisode } from "../../lib/gemini";
import { speak, stopSpeaking } from "../../lib/speech";
import { formatDateTime } from "../../lib/id";
import { uid } from "../../lib/id";
import type { RadioEpisode } from "../../types";

interface RadioScreenProps {
  viewerId: string;
  recorderView: boolean;
  onComposeNews: () => void;
}

export function RadioScreen({ viewerId, recorderView, onComposeNews }: RadioScreenProps) {
  const store = useStore();
  const { state } = store;
  const { notify } = useToast();

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [playingEpisodeId, setPlayingEpisodeId] = useState<string | null>(null);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const advanceLock = useRef(false);

  const pendingNews = state.newsItems.filter((n) => n.status === "scheduled");
  const myNews = state.newsItems.filter((n) => n.authorId === viewerId && n.status !== "cancelled");
  const pastEpisodes = state.episodes.filter((e) => e.status === "ready");

  function playFrom(episode: RadioEpisode, index: number) {
    setPlayingEpisodeId(episode.id);
    setSegmentIndex(index);
    setIsPaused(false);
    const text = index === -1 ? episode.intro : episode.segments[index]?.text;
    if (!text) return;
    speak(text, {
      rate: "normal",
      onEnd: () => {
        if (advanceLock.current) return;
        const nextIndex = index + 1;
        if (nextIndex < episode.segments.length) {
          playFrom(episode, nextIndex);
        } else {
          setIsPaused(true);
          store.markEpisodePlayed(episode.id);
        }
      }
    });
  }

  function togglePlay(episode: RadioEpisode) {
    if (playingEpisodeId === episode.id && !isPaused) {
      stopSpeaking();
      setIsPaused(true);
      return;
    }
    advanceLock.current = false;
    playFrom(episode, playingEpisodeId === episode.id ? segmentIndex : -1);
  }

  function stepSegment(episode: RadioEpisode, delta: number) {
    advanceLock.current = true;
    stopSpeaking();
    window.setTimeout(() => {
      advanceLock.current = false;
      const next = Math.max(-1, Math.min(episode.segments.length - 1, segmentIndex + delta));
      playFrom(episode, next);
    }, 30);
  }

  async function generateEpisode() {
    if (pendingNews.length === 0) return;
    setGenerating(true);
    setGenError("");
    const outcome = await draftRadioEpisode(
      pendingNews.map((n) => ({ id: n.id, authorName: n.authorName, relationship: n.relationship, body: n.photoCaption || n.body }))
    );
    setGenerating(false);
    if (!outcome.ok) {
      setGenError(outcome.error);
      return;
    }
    const episode: RadioEpisode = {
      id: uid(),
      dateLabel: new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date()) + " 방송",
      status: "ready",
      title: outcome.data.title,
      intro: outcome.data.intro,
      segments: outcome.data.segments.map((s, i) => {
        const source = pendingNews.find((n) => n.id === s.newsItemId) ?? pendingNews[i];
        return { id: uid(), newsItemId: source.id, authorName: source.authorName, relationship: source.relationship, text: s.text, order: i + 1 };
      }),
      createdAt: new Date().toISOString(),
      playedAt: null
    };
    store.commitEpisode(episode, pendingNews.map((n) => n.id));
    notify("새 방송을 만들었어요.");
  }

  if (recorderView) {
    return (
      <section className="screen">
        <div className="page-title">
          <small>FAMILY RADIO</small>
          <h1>오늘, 가족은요</h1>
          <p>가족의 하루를 목소리로 편안하게 들어보세요.</p>
        </div>

        {pastEpisodes.length === 0 && pendingNews.length === 0 ? (
          <EmptyState icon={<RadioIcon />} title="오늘 도착한 새 소식이 없어요" description="소식이 도착하면 다음 방송에 담아드릴게요." />
        ) : (
          <>
            {pendingNews.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <p className="card-label">대기 중인 소식 {pendingNews.length}건</p>
                <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={generateEpisode} disabled={generating}>
                  {generating ? "방송 만드는 중…" : "지금 방송 만들기"}
                </button>
                {genError && <p className="helper-text" style={{ color: "var(--error)" }}>{genError}</p>}
              </div>
            )}

            {pastEpisodes.map((episode) => (
              <div className="radio-player" key={episode.id} style={{ marginBottom: 16 }}>
                <div className="radio-waves">
                  <i /><i /><i /><i /><i />
                </div>
                <p>{episode.title} · {episode.dateLabel}</p>
                <div className="radio-controls">
                  <button onClick={() => stepSegment(episode, -1)}>
                    <ChevronLeft size={18} />
                  </button>
                  <button className="play-main" onClick={() => togglePlay(episode)}>
                    {playingEpisodeId === episode.id && !isPaused ? <Pause /> : <Play fill="currentColor" />}
                    {playingEpisodeId === episode.id && !isPaused ? "일시정지" : "재생하기"}
                  </button>
                  <button onClick={() => stepSegment(episode, 1)}>
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="segment-list">
                  {episode.segments.map((seg, i) => (
                    <div className={`segment-item ${playingEpisodeId === episode.id && segmentIndex === i ? "current" : ""}`} key={seg.id}>
                      <div className="avatar">{seg.authorName.slice(-2)}</div>
                      <div>
                        <strong>
                          {seg.relationship} {seg.authorName}
                        </strong>
                        <small>세그먼트 {i + 1}</small>
                        <p style={{ margin: 0, fontSize: "0.85rem" }}>{seg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </section>
    );
  }

  return (
    <section className="screen">
      <div className="page-title">
        <small>FAMILY RADIO</small>
        <h1>소식과 방송</h1>
        <p>보낸 소식이 방송에 담기는지 확인해 보세요.</p>
      </div>

      <button className="btn btn-accent" style={{ marginBottom: 16 }} onClick={onComposeNews}>
        <Send size={18} /> 소식 보내기
      </button>

      <div className="page-title">
        <small>MY NEWS</small>
        <h1 style={{ fontSize: "1.1rem" }}>내가 보낸 소식</h1>
      </div>
      {myNews.length ? (
        <div className="list-grid">
          {myNews.map((n) => (
            <article className="list-item" key={n.id}>
              <div className="list-item-head">
                <div className="list-item-date">{formatDateTime(n.createdAt)}</div>
                <span className={`state-pill ${n.status === "broadcast" ? "done" : "pending"}`}>
                  {n.status === "broadcast" ? "방송에 포함됨" : "다음 방송 예정"}
                </span>
              </div>
              <p>{n.photoCaption || n.body}</p>
              {n.status === "scheduled" && (
                <div className="list-item-meta">
                  <span>방송 생성 전까지 수정·취소할 수 있어요</span>
                  <button onClick={() => setCancelTargetId(n.id)}>
                    <X size={14} /> 취소
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={<RadioIcon />} title="아직 보낸 소식이 없어요" description="위 버튼으로 첫 소식을 보내 보세요." />
      )}

      {pastEpisodes.length > 0 && (
        <>
          <div className="page-title" style={{ marginTop: 22 }}>
            <small>PAST EPISODES</small>
            <h1 style={{ fontSize: "1.1rem" }}>지난 방송</h1>
          </div>
          {pastEpisodes.map((episode) => (
            <div className="radio-player" key={episode.id} style={{ marginBottom: 14 }}>
              <p>{episode.title} · {episode.dateLabel}</p>
              <div className="radio-controls">
                <button className="play-main" onClick={() => togglePlay(episode)}>
                  {playingEpisodeId === episode.id && !isPaused ? <Pause /> : <Play fill="currentColor" />}
                  다시 듣기
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {cancelTargetId && (
        <ConfirmSheet
          title="소식을 취소할까요?"
          description="방송이 만들어지기 전까지는 언제든 취소할 수 있어요."
          confirmLabel="취소하기"
          danger
          onCancel={() => setCancelTargetId(null)}
          onConfirm={() => {
            store.cancelNewsItem(cancelTargetId);
            notify("소식을 취소했어요.");
            setCancelTargetId(null);
          }}
        />
      )}
    </section>
  );
}
