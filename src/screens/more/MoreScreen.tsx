import { useState } from "react";
import { CircleUserRound, Database, Play, Trash2, UserMinus } from "lucide-react";
import { useStore } from "../../state/store";
import { useToast } from "../../components/common/Toast";
import { ConfirmSheet } from "../../components/common/ConfirmSheet";
import { speak } from "../../lib/speech";
import type { AiVoiceSettings, FamilyMember, FontScale, Visibility } from "../../types";

interface MoreScreenProps {
  viewer: FamilyMember;
  recorderView: boolean;
}

const FONT_LABEL: Record<FontScale, string> = { 0.92: "작게", 1: "보통", 1.2: "크게" };

export function MoreScreen({ viewer, recorderView }: MoreScreenProps) {
  const store = useStore();
  const { state } = store;
  const { notify } = useToast();
  const [disconnectTarget, setDisconnectTarget] = useState<FamilyMember | null>(null);
  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm">("idle");
  const [deleteInput, setDeleteInput] = useState("");

  const voice = state.recorderProfile.aiVoice;
  const visibilityCounts = state.memories.reduce(
    (acc, m) => {
      if (m.deletedAt) return acc;
      acc[m.visibility] += 1;
      return acc;
    },
    { family: 0, private: 0, custom: 0 } as Record<Visibility, number>
  );

  function updateVoice(patch: Partial<AiVoiceSettings>) {
    store.updateAiVoice(patch);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ieum-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
    notify("데이터를 내보냈어요.");
  }

  function deleteAccount() {
    localStorage.clear();
    notify("계정 정보를 삭제했어요. 처음 화면으로 돌아가요.");
    window.setTimeout(() => window.location.reload(), 900);
  }

  return (
    <section className="screen">
      <div className="page-title">
        <small>SETTINGS</small>
        <h1>내게 편한 이음</h1>
        <p>읽기 편한 크기와 계정 정보를 관리해요.</p>
      </div>

      <div className="card">
        <div className="account-card">
          <CircleUserRound size={40} color="var(--forest)" />
          <div>
            <strong>
              {viewer.relationship} {viewer.displayName}
            </strong>
            <span>{state.family.name}</span>
          </div>
        </div>
      </div>

      {recorderView && (
        <div className="card" style={{ marginTop: 14 }}>
          <p className="card-label">AI 목소리 설정</p>
          <div className="setting-row">
            <div>
              <strong>말투</strong>
              <small>대화의 분위기를 골라요.</small>
            </div>
          </div>
          <div className="segmented">
            {(["warm", "calm", "bright"] as const).map((t) => (
              <button key={t} className={voice.tone === t ? "active" : ""} onClick={() => updateVoice({ tone: t })}>
                {{ warm: "다정하게", calm: "차분하게", bright: "밝게" }[t]}
              </button>
            ))}
          </div>
          <div className="segmented" style={{ marginTop: 10 }}>
            {(["slow", "normal", "fast"] as const).map((r) => (
              <button key={r} className={voice.rate === r ? "active" : ""} onClick={() => updateVoice({ rate: r })}>
                {{ slow: "느림", normal: "보통", fast: "빠름" }[r]}
              </button>
            ))}
          </div>
          <label className="field" style={{ marginTop: 10 }}>
            호칭
            <input value={voice.address} onChange={(e) => updateVoice({ address: e.target.value })} />
          </label>
          <button
            className="btn btn-secondary"
            style={{ marginTop: 10 }}
            onClick={() => speak(`안녕하세요, ${voice.address}. 오늘도 편안하게 이야기 나눠요.`, { rate: voice.rate })}
          >
            <Play size={16} /> 1문장 미리 듣기
          </button>
        </div>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <p className="card-label">접근성</p>
        <div className="setting-row">
          <div>
            <strong>글자 크기</strong>
            <small>현재: {FONT_LABEL[state.accessibility.fontScale]}</small>
          </div>
        </div>
        <div className="segmented">
          {([0.92, 1, 1.2] as FontScale[]).map((scale) => (
            <button key={scale} className={state.accessibility.fontScale === scale ? "active" : ""} onClick={() => store.updateAccessibility({ fontScale: scale })}>
              {FONT_LABEL[scale]}
            </button>
          ))}
        </div>
        <div className="setting-row">
          <div>
            <strong>고대비 모드</strong>
            <small>글자와 배경 대비를 높여요.</small>
          </div>
          <ToggleSwitch checked={state.accessibility.highContrast} onChange={(v) => store.updateAccessibility({ highContrast: v })} />
        </div>
        <div className="setting-row">
          <div>
            <strong>자막 항상 표시</strong>
            <small>AI 음성과 함께 자막을 보여줘요.</small>
          </div>
          <ToggleSwitch checked={state.accessibility.captionsAlways} onChange={(v) => store.updateAccessibility({ captionsAlways: v })} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <p className="card-label">알림</p>
        <div className="setting-row">
          <div>
            <strong>대화 알림 시간</strong>
          </div>
          <input
            type="time"
            style={{ width: 120, minHeight: 40 }}
            value={state.schedule.conversationTime}
            onChange={(e) => store.updateSchedule({ conversationTime: e.target.value })}
          />
        </div>
        <div className="setting-row">
          <div>
            <strong>라디오 방송 시간</strong>
          </div>
          <input
            type="time"
            style={{ width: 120, minHeight: 40 }}
            value={state.schedule.radioTimes[0] ?? "08:00"}
            onChange={(e) => store.updateSchedule({ radioTimes: [e.target.value, state.schedule.radioTimes[1]].filter(Boolean) as string[] })}
          />
        </div>
        <div className="setting-row">
          <div>
            <strong>알림 받기</strong>
            <small>꺼도 핵심 기능은 계속 사용할 수 있어요.</small>
          </div>
          <ToggleSwitch checked={state.schedule.notifyConversation} onChange={(v) => store.updateSchedule({ notifyConversation: v, notifyRadio: v })} />
        </div>
        <div className="setting-row">
          <div>
            <strong>라디오 자동 재생</strong>
          </div>
          <ToggleSwitch checked={state.schedule.autoplayRadio} onChange={(v) => store.updateSchedule({ autoplayRadio: v })} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <p className="card-label">가족 관리</p>
        {state.family.members.map((m) => (
          <div className="setting-row" key={m.id}>
            <div>
              <strong>
                {m.relationship} {m.displayName}
              </strong>
              <small>{{ recorder: "기록자", family_admin: "가족 관리자", family_member: "가족 구성원" }[m.role]}</small>
            </div>
            {m.id !== viewer.id && (
              <button className="btn btn-ghost btn-inline" onClick={() => setDisconnectTarget(m)}>
                <UserMinus size={15} /> 연결 해제
              </button>
            )}
          </div>
        ))}
        <div className="invite-card" style={{ marginTop: 12 }}>
          <small>가족 연결 코드</small>
          <strong>{state.family.inviteCode}</strong>
        </div>
      </div>

      {recorderView && (
        <div className="card" style={{ marginTop: 14 }}>
          <p className="card-label">개인정보·공개 기록 한눈에 보기</p>
          <p style={{ marginTop: 10, fontSize: "0.88rem" }}>
            가족 전체 공개 {visibilityCounts.family}건 · 나만 보기 {visibilityCounts.private}건 · 선택 공개 {visibilityCounts.custom}건
          </p>
        </div>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <p className="card-label">데이터 관리</p>
        <div className="danger-zone" style={{ marginTop: 10 }}>
          <button className="btn btn-secondary" onClick={exportData}>
            <Database size={16} /> 내 데이터 내보내기
          </button>
          <button className="btn btn-danger" onClick={() => setDeleteStep("confirm")}>
            <Trash2 size={16} /> 계정 삭제
          </button>
        </div>
      </div>

      <p className="safety-copy">이음은 연결된 가족만 기록을 볼 수 있도록 설계되었습니다. 민감한 정보는 '나만 보기'로 남겨주세요.</p>

      {disconnectTarget && (
        <ConfirmSheet
          title="연결을 해제할까요?"
          description={`연결을 해제하면 ${disconnectTarget.displayName}님은 앞으로 이 가족 공간에 접근할 수 없어요. 이미 공개된 기록은 즉시 사라지지 않고 별도로 정리돼요. (체험판에서는 실제로 해제되지 않아요)`}
          confirmLabel="연결 해제"
          danger
          onCancel={() => setDisconnectTarget(null)}
          onConfirm={() => {
            notify("체험판에서는 실제 연결 해제가 반영되지 않아요.");
            setDisconnectTarget(null);
          }}
        />
      )}

      {deleteStep === "confirm" && (
        <ConfirmSheet
          title="계정을 삭제할까요?"
          description="계속하려면 '삭제'를 입력해 주세요. 이 기기에 저장된 모든 체험 데이터가 사라져요."
          confirmLabel="영구 삭제"
          danger
          onCancel={() => { setDeleteStep("idle"); setDeleteInput(""); }}
          onConfirm={() => {
            if (deleteInput.trim() !== "삭제") {
              notify("'삭제'라고 입력해야 진행할 수 있어요.");
              return;
            }
            deleteAccount();
          }}
        >
          <input value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} placeholder="삭제" />
        </ConfirmSheet>
      )}
    </section>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
    </label>
  );
}
