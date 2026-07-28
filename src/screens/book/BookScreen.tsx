import { useState } from "react";
import { ArrowLeft, Check, FileDown, RefreshCcw } from "lucide-react";
import { useStore } from "../../state/store";
import { useToast } from "../../components/common/Toast";
import { EmptyState } from "../../components/common/EmptyState";
import { PageStatePill } from "../../components/common/StatePill";
import { canViewPage, isRecorderViewer } from "../../lib/visibility";
import { computeBookProgress } from "../../lib/bookMath";
import { draftBookPage } from "../../lib/gemini";
import { Mascot } from "../../components/common/Mascot";

interface BookScreenProps {
  viewerId: string;
  recorderView: boolean;
}

export function BookScreen({ viewerId, recorderView }: BookScreenProps) {
  const store = useStore();
  const { state } = store;
  const { notify } = useToast();
  const [openChapterId, setOpenChapterId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [editBody, setEditBody] = useState<string | null>(null);

  const { approved, draft } = computeBookProgress(state.pages);
  const openChapter = state.chapters.find((c) => c.id === openChapterId) || null;
  const openPage = openChapter ? state.pages.find((p) => p.chapterId === openChapter.id) || null : null;

  const familyVisible = !recorderView;

  async function generateDraft(chapterId: string, theme: string) {
    setGenError("");
    const candidates = state.memories.filter((m) => !m.deletedAt && m.category === theme);
    if (candidates.length === 0) {
      notify("아직 이 주제에 담긴 기억이 없어요.");
      return;
    }
    setGenerating(true);
    const outcome = await draftBookPage(candidates.map((m) => ({ id: m.id, title: m.title, transcript: m.transcript })));
    setGenerating(false);
    if (!outcome.ok) {
      setGenError(outcome.error);
      return;
    }
    store.commitPageDraft(chapterId, {
      title: outcome.data.title,
      body: outcome.data.body,
      sourceMemoryIds: candidates.map((m) => m.id),
      unresolved: outcome.data.unresolved,
      status: outcome.data.unresolved.length > 0 ? "needs_review" : "draft",
      visibility: "family"
    });
    notify("새 초안을 만들었어요.");
  }

  if (openChapter) {
    const visible = openPage ? canViewPage(openPage, viewerId, state.family, state.memories) : false;

    if (familyVisible && (!openPage || !visible)) {
      return (
        <section className="screen">
          <button className="btn btn-text" onClick={() => setOpenChapterId(null)}>
            <ArrowLeft size={18} /> 목록으로
          </button>
          <EmptyState icon={<Mascot mood="calm" size={64} />} title="아직 공개된 페이지가 없어요" description="기록자가 승인하면 이곳에 보여요." />
        </section>
      );
    }

    return (
      <section className="screen">
        <button className="btn btn-text" onClick={() => setOpenChapterId(null)}>
          <ArrowLeft size={18} /> 목록으로
        </button>
        <div className="page-title">
          <small>{openChapter.title}</small>
          {openPage && <PageStatePill status={openPage.status} />}
        </div>

        {!openPage || openPage.status === "insufficient" ? (
          <EmptyState
            icon={<Mascot mood="calm" size={64} />}
            title="재료가 더 필요해요"
            description="이 주제로 이야기를 더 나누면 초안을 만들 수 있어요."
          />
        ) : (
          <>
            {editBody !== null ? (
              <div className="card">
                <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} style={{ minHeight: 180 }} />
                <div className="btn-row" style={{ marginTop: 12 }}>
                  <button className="btn btn-ghost" onClick={() => setEditBody(null)}>
                    취소
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      store.commitPageDraft(openChapter.id, {
                        title: openPage.title,
                        body: editBody,
                        sourceMemoryIds: openPage.sourceMemoryIds,
                        unresolved: openPage.unresolved,
                        status: "needs_review",
                        visibility: "family"
                      });
                      setEditBody(null);
                      notify("문장을 수정했어요.");
                    }}
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <div className="card">
                <h2 style={{ font: "700 1.15rem 'Gowun Batang', serif", margin: "0 0 12px" }}>{openPage.title}</h2>
                <p className="page-body">{openPage.body}</p>
                {openPage.sourceMemoryIds.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    {openPage.sourceMemoryIds.map((id) => {
                      const src = state.memories.find((m) => m.id === id);
                      return src ? (
                        <span className="source-tag" key={id}>
                          근거: {src.title}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                {openPage.unresolved.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    {openPage.unresolved.map((u, i) => (
                      <span className="confirm-flag" key={i}>
                        확인 필요 · {u.note}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {recorderView && editBody === null && (
              <div className="btn-row" style={{ marginTop: 14 }}>
                <button className="btn btn-ghost" onClick={() => setEditBody(openPage.body)}>
                  편집하기
                </button>
                {openPage.status !== "approved" && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      store.approvePage(openPage.id);
                      notify("페이지를 승인했어요. 완성 페이지로 반영돼요.");
                    }}
                  >
                    <Check size={18} /> 승인하기
                  </button>
                )}
              </div>
            )}

            {recorderView && (
              <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => generateDraft(openChapter.id, openChapter.theme)} disabled={generating}>
                <RefreshCcw size={16} /> {generating ? "생성 중…" : "이 주제로 다시 생성"}
              </button>
            )}

            {openPage.status === "approved" && recorderView && (
              <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => notify("PDF 내보내기는 다음 업데이트에서 제공돼요.")}>
                <FileDown size={16} /> PDF로 내보내기
              </button>
            )}

            {genError && <p className="helper-text" style={{ color: "var(--error)" }}>{genError}</p>}
          </>
        )}

        {recorderView && (!openPage || openPage.status === "insufficient") && (
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => generateDraft(openChapter.id, openChapter.theme)} disabled={generating}>
            {generating ? "생성 중…" : "초안 생성하기"}
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="screen">
      <div className="page-title">
        <small>MY BOOK</small>
        <h1>나의 자서전</h1>
        <p>완성 {approved}쪽 · 초안 {draft}쪽</p>
      </div>
      <div className="chapter-list">
        {state.chapters.map((c) => {
          const page = state.pages.find((p) => p.chapterId === c.id);
          const visibleToViewer = familyVisible ? Boolean(page && canViewPage(page, viewerId, state.family, state.memories)) : true;
          return (
            <button className="chapter-item" key={c.id} onClick={() => setOpenChapterId(c.id)}>
              <div className="chapter-num">{c.order}</div>
              <div style={{ flex: 1 }}>
                <strong>{c.title}</strong>
                <small>{familyVisible && !visibleToViewer ? "공개된 내용이 없어요" : page ? "" : "재료 부족"}</small>
              </div>
              {(!familyVisible || visibleToViewer) && page && <PageStatePill status={page.status} />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
