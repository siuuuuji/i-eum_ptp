import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Mic, Send, Square, Type } from "lucide-react";
import { useStore } from "../../state/store";
import { useToast } from "../../components/common/Toast";
import { speak } from "../../lib/speech";
import { readLocal, writeLocal } from "../../lib/storage";
import type { NewsInputType } from "../../types";

type Step = "select" | "compose" | "preview";

const DRAFT_KEY = "ieum-news-draft-v1";

interface DraftShape {
  type: NewsInputType;
  body: string;
  photoCaption: string;
}

export function NewsComposeScreen({ onClose }: { onClose: () => void }) {
  const store = useStore();
  const { state } = store;
  const { notify } = useToast();
  const viewer = state.family.members.find((m) => m.id === state.activeViewerId) ?? state.family.members[0];

  const [step, setStep] = useState<Step>("select");
  const [type, setType] = useState<NewsInputType>("text");
  const [body, setBody] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [pronunciationNote, setPronunciationNote] = useState("");
  const [recording, setRecording] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);
  const [micError, setMicError] = useState("");

  const mediaRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const draft = readLocal<DraftShape | null>(DRAFT_KEY, null);
    if (draft && (draft.body || draft.photoCaption)) {
      setType(draft.type);
      setBody(draft.body);
      setPhotoCaption(draft.photoCaption);
      setStep("compose");
      notify("임시 저장된 소식을 불러왔어요.");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (step === "compose") writeLocal<DraftShape>(DRAFT_KEY, { type, body, photoCaption });
  }, [type, body, photoCaption, step]);

  function clearDraft() {
    writeLocal(DRAFT_KEY, null);
  }

  function handlePhotoSelect(file: File | undefined) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError("사진 용량이 너무 커요. 8MB 이하로 올려 주세요.");
      return;
    }
    setPhotoError("");
    notify("사진을 담았어요. 설명을 적어 주세요.");
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = new MediaRecorder(stream);
      mediaRef.current = media;
      media.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setHasVoice(true);
      };
      media.start();
      setRecording(true);
      setMicError("");
    } catch {
      setMicError("마이크를 사용할 수 없어요. 권한을 허용하거나 글로 남겨 주세요.");
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  function previewText(): string {
    return type === "photo" ? photoCaption : body;
  }

  function canGoPreview(): boolean {
    if (type === "text") return body.trim().length > 0;
    if (type === "photo") return photoCaption.trim().length > 0;
    return hasVoice || body.trim().length > 0;
  }

  function submit() {
    store.addNewsItem({
      authorId: viewer.id,
      authorName: viewer.displayName,
      relationship: viewer.relationship,
      type,
      body: type === "voice" ? body || "(목소리 소식)" : body,
      photoCaption: type === "photo" ? photoCaption : undefined,
      pronunciationNote: pronunciationNote || undefined
    });
    clearDraft();
    const nextTime = state.schedule.radioTimes[0];
    notify(nextTime ? `소식을 보냈어요. 다음 방송(${nextTime}) 포함 예정이에요.` : "소식을 보냈어요.");
    onClose();
  }

  return (
    <div className="screen">
      <button className="btn btn-text" onClick={onClose}>
        <ArrowLeft size={18} /> 나가기
      </button>
      <div className="page-title">
        <small>가족 소식</small>
        <h1>오늘의 소식을 들려주세요</h1>
      </div>

      {step === "select" && (
        <div className="choice-group">
          <button className="choice-card" onClick={() => { setType("text"); setStep("compose"); }}>
            <Type size={20} />
            <div>
              <strong>글로 남기기</strong>
              <small>짧게 적어서 전해요.</small>
            </div>
          </button>
          <button className="choice-card" onClick={() => { setType("photo"); setStep("compose"); }}>
            <Camera size={20} />
            <div>
              <strong>사진과 설명</strong>
              <small>사진에 짧은 설명을 더해요.</small>
            </div>
          </button>
          <button className="choice-card" onClick={() => { setType("voice"); setStep("compose"); }}>
            <Mic size={20} />
            <div>
              <strong>직접 녹음</strong>
              <small>목소리로 그대로 전해요.</small>
            </div>
          </button>
        </div>
      )}

      {step === "compose" && (
        <div className="choice-group">
          {type === "text" && (
            <label className="field">
              소식 내용
              <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="오늘 있었던 일을 짧게 들려주세요." />
            </label>
          )}

          {type === "photo" && (
            <>
              <label className="field">
                사진 선택
                <input type="file" accept="image/*" onChange={(e) => handlePhotoSelect(e.target.files?.[0])} />
              </label>
              {photoError && <p className="helper-text" style={{ color: "var(--error)" }}>{photoError}</p>}
              <label className="field">
                사진 설명
                <textarea value={photoCaption} onChange={(e) => setPhotoCaption(e.target.value)} placeholder="이 사진에 대해 설명해 주세요." />
              </label>
            </>
          )}

          {type === "voice" && (
            <>
              <button className={`btn ${recording ? "btn-danger" : "btn-secondary"}`} onClick={recording ? stopRecording : startRecording}>
                {recording ? <Square size={18} /> : <Mic size={18} />} {recording ? "녹음 끝내기" : hasVoice ? "다시 녹음" : "녹음 시작"}
              </button>
              {hasVoice && <p className="helper-text" style={{ color: "var(--forest)" }}>목소리를 담았어요 ✓</p>}
              {micError && <p className="helper-text" style={{ color: "var(--error)" }}>{micError}</p>}
              <label className="field">
                내용 요약 (AI 방송용 문장)
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="목소리 내용을 짧게 요약해 주세요." />
              </label>
            </>
          )}

          <button className="btn btn-primary" disabled={!canGoPreview()} onClick={() => setStep("preview")}>
            다음
          </button>
          <button className="btn btn-text" onClick={() => setStep("select")}>
            뒤로
          </button>
        </div>
      )}

      {step === "preview" && (
        <div className="choice-group">
          <div className="card">
            <p className="card-label">AI가 읽을 문장 미리보기</p>
            <p style={{ margin: "10px 0" }}>{previewText()}</p>
            <button className="btn btn-secondary" onClick={() => speak(previewText())}>
              미리 듣기
            </button>
          </div>
          <label className="field">
            이름·발음 수정 (선택)
            <input
              value={pronunciationNote}
              onChange={(e) => setPronunciationNote(e.target.value)}
              placeholder="예: '민준'은 '민-준'으로 읽어주세요"
            />
          </label>
          <button className="btn btn-accent btn-lg" onClick={submit}>
            <Send size={18} /> 다음 방송에 보내기
          </button>
          <button className="btn btn-text" onClick={() => setStep("compose")}>
            뒤로
          </button>
        </div>
      )}
    </div>
  );
}
