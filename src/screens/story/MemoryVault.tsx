import { useMemo, useState } from "react";
import { BookOpen, Search, Trash2, Volume2 } from "lucide-react";
import { useStore } from "../../state/store";
import { useToast } from "../../components/common/Toast";
import { EmptyState } from "../../components/common/EmptyState";
import { ConfirmSheet } from "../../components/common/ConfirmSheet";
import { canViewMemory, isRecorderViewer, visibilityLabel } from "../../lib/visibility";
import { daysBetween, formatDate, formatDateTime } from "../../lib/id";
import type { MemoryRecord, Visibility } from "../../types";

interface MemoryVaultProps {
  viewerId: string;
}

export function MemoryVault({ viewerId }: MemoryVaultProps) {
  const store = useStore();
  const { state } = store;
  const { notify } = useToast();
  const recorderView = isRecorderViewer(viewerId, state.family);

  const [query, setQuery] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const visibleMemories = useMemo(() => {
    const base = recorderView
      ? state.memories.filter((m) => (showTrash ? Boolean(m.deletedAt) && daysBetween(m.deletedAt!) <= 30 : !m.deletedAt))
      : state.memories.filter((m) => !m.deletedAt && canViewMemory(m, viewerId, state.family));
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((m) => `${m.title} ${m.summary} ${m.transcript} ${m.tags.join(" ")}`.toLowerCase().includes(q));
  }, [state.memories, recorderView, showTrash, query, viewerId, state.family]);

  const detail = state.memories.find((m) => m.id === detailId) || null;

  return (
    <div>
      <div className="search">
        <Search size={20} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="기억 속 단어를 찾아보세요" />
      </div>

      {recorderView && (
        <div className="segmented" style={{ marginBottom: 14 }}>
          <button className={!showTrash ? "active" : ""} onClick={() => setShowTrash(false)}>
            보관함
          </button>
          <button className={showTrash ? "active" : ""} onClick={() => setShowTrash(true)}>
            휴지통
          </button>
        </div>
      )}

      {visibleMemories.length ? (
        <div className="list-grid">
          {visibleMemories.map((m) => (
            <article className="list-item" key={m.id}>
              <div className="list-item-head">
                <div>
                  <div className="list-item-date">{formatDate(m.createdAt)}</div>
                  <h3>{m.title}</h3>
                </div>
                {m.unresolved.length > 0 && <span className="confirm-flag">확인 필요</span>}
              </div>
              <p>{m.summary}</p>
              <div className="list-item-meta">
                <span>{visibilityLabel(m.visibility)}</span>
                <div style={{ display: "flex", gap: 10 }}>
                  {m.hasVoiceNote && (
                    <button onClick={() => notify("체험 모드에서는 목소리 재생을 지원하지 않아요.")}>
                      <Volume2 size={16} /> 목소리
                    </button>
                  )}
                  {recorderView && !showTrash && <button onClick={() => setDetailId(m.id)}>자세히</button>}
                  {recorderView && showTrash && (
                    <button
                      onClick={() => {
                        store.restoreMemory(m.id);
                        notify("기억을 복구했어요.");
                      }}
                    >
                      복구
                    </button>
                  )}
                  {!recorderView && (
                    <button onClick={() => notify("따뜻한 반응을 보냈어요.")}>따뜻한 반응</button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen />}
          title={query ? "검색 결과가 없어요" : showTrash ? "휴지통이 비어 있어요" : "아직 저장된 기억이 없어요"}
          description={query ? "다른 단어로 다시 찾아보세요." : "오늘 질문에 답해 첫 기억을 남겨 보세요."}
        />
      )}

      {detail && (
        <MemoryDetailModal
          memory={detail}
          familyMembers={state.family.members.filter((m) => m.role !== "recorder")}
          onClose={() => setDetailId(null)}
          onSave={(patch) => {
            store.updateMemory(detail.id, patch, "기록자가 내용을 수정했어요");
            notify("수정 내용을 저장했어요.");
          }}
          onVisibilityChange={(visibility, ids) => {
            store.setMemoryVisibility(detail.id, visibility, ids);
            notify("공개 범위를 변경했어요.");
          }}
          onDelete={() => setConfirmDeleteId(detail.id)}
        />
      )}

      {confirmDeleteId && (
        <ConfirmSheet
          title="기억을 삭제할까요?"
          description="삭제해도 30일 동안은 휴지통에서 복구할 수 있어요. 이후에는 영구히 사라져요."
          confirmLabel="삭제하기"
          danger
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => {
            store.softDeleteMemory(confirmDeleteId);
            notify("기억을 삭제했어요. 30일 안에는 복구할 수 있어요.");
            setConfirmDeleteId(null);
            setDetailId(null);
          }}
        />
      )}
    </div>
  );
}

function MemoryDetailModal({
  memory,
  familyMembers,
  onClose,
  onSave,
  onVisibilityChange,
  onDelete
}: {
  memory: MemoryRecord;
  familyMembers: { id: string; displayName: string; relationship: string }[];
  onClose: () => void;
  onSave: (patch: Partial<MemoryRecord>) => void;
  onVisibilityChange: (visibility: Visibility, ids: string[]) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(memory.title);
  const [summary, setSummary] = useState(memory.summary);
  const [transcript, setTranscript] = useState(memory.transcript);
  const [visibility, setVisibility] = useState<Visibility>(memory.visibility);
  const [customIds, setCustomIds] = useState<string[]>(memory.visibleToMemberIds);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <h2>기억 수정</h2>
        <label className="field">
          제목
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field">
          요약
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} style={{ minHeight: 60 }} />
        </label>
        <label className="field">
          전문
          <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} style={{ minHeight: 110 }} />
        </label>

        <p className="card-label">공개 범위</p>
        <div className="segmented">
          {(["family", "private", "custom"] as const).map((v) => (
            <button key={v} className={visibility === v ? "active" : ""} onClick={() => setVisibility(v)}>
              {{ family: "가족 전체", private: "나만 보기", custom: "선택 가족" }[v]}
            </button>
          ))}
        </div>
        {visibility === "custom" && (
          <div className="choice-group">
            {familyMembers.map((m) => (
              <button
                key={m.id}
                className={`choice-card ${customIds.includes(m.id) ? "selected" : ""}`}
                onClick={() => setCustomIds((cur) => (cur.includes(m.id) ? cur.filter((id) => id !== m.id) : [...cur, m.id]))}
              >
                <strong>
                  {m.relationship} {m.displayName}
                </strong>
              </button>
            ))}
          </div>
        )}

        <p className="helper-text">마지막 수정: {formatDateTime(memory.updatedAt)}</p>

        <div className="btn-row">
          <button className="btn btn-danger" onClick={onDelete}>
            <Trash2 size={16} /> 삭제
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onSave({ title, summary, transcript });
              onVisibilityChange(visibility, visibility === "custom" ? customIds : []);
              onClose();
            }}
          >
            저장
          </button>
        </div>
        <button className="btn btn-text" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
