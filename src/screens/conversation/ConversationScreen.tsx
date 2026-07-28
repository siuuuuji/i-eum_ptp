import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Pause, Play, RotateCcw, Square, X } from "lucide-react";
import { useStore } from "../../state/store";
import { useToast } from "../../components/common/Toast";
import { Mascot, type MascotMood } from "../../components/common/Mascot";
import { pickMainQuestion, QUESTION_CATEGORIES } from "../../data/questions";
import { converseReply, summarizeMemory } from "../../lib/gemini";
import { createRecognizer, isRecognitionSupported, isSynthesisSupported, speak, stopSpeaking, type RecognizerHandle } from "../../lib/speech";
import { daysBetween } from "../../lib/id";
import type { UnresolvedItem, Visibility } from "../../types";

type Phase = "prep" | "greeting" | "listening" | "thinking" | "paused" | "ending" | "summarizing" | "review" | "summarizeFailed";

const MAX_FOLLOW_UPS = 2;

export function ConversationScreen({ onClose }: { onClose: () => void }) {
  const store = useStore();
  const { state } = store;
  const { notify } = useToast();

  const hasResumable =
    state.activeSession &&
    state.activeSession.status !== "completed" &&
    state.activeSession.status !== "abandoned" &&
    daysBetween(state.activeSession.updatedAt) < 1;

  const [phase, setPhase] = useState<Phase>("prep");
  const [categoryIndex, setCategoryIndex] = useState(new Date().getDate() % QUESTION_CATEGORIES.length);
  const [interim, setInterim] = useState("");
  const [micDenied, setMicDenied] = useState(false);
  const [textMode, setTextMode] = useState(!isRecognitionSupported());
  const [textAnswer, setTextAnswer] = useState("");
  const [aiError, setAiError] = useState("");
  const [lastAiText, setLastAiText] = useState("");
  const [pendingReplyTurns, setPendingReplyTurns] = useState<{ speaker: "ai" | "user"; text: string }[] | null>(null);

  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewSummary, setReviewSummary] = useState("");
  const [reviewTags, setReviewTags] = useState<string[]>([]);
  const [unresolved, setUnresolved] = useState<UnresolvedItem[]>([]);
  const [visibility, setVisibility] = useState<Visibility>(state.recorderProfile.defaultVisibility);
  const [customIds, setCustomIds] = useState<string[]>([]);

  const recognizerRef = useRef<RecognizerHandle | null>(null);
  const session = state.activeSession;

  useEffect(() => () => {
    recognizerRef.current?.abort();
    stopSpeaking();
  }, []);

  const category = QUESTION_CATEGORIES[categoryIndex];
  const question = pickMainQuestion(category, new Date().getDate());

  function beginSession() {
    store.startSession(category.label, question);
    setPhase("greeting");
    runAiUtterance(question, true);
  }

  function resumeSession() {
    if (!session) return;
    setPhase("greeting");
    const last = session.turns[session.turns.length - 1];
    runAiUtterance(last?.speaker === "ai" ? last.text : question, false);
  }

  function runAiUtterance(text: string, isFirst: boolean) {
    setLastAiText(text);
    if (!isFirst) store.setSessionStatus("listening");
    const ok = speak(text, {
      rate: state.recorderProfile.aiVoice.rate,
      onEnd: () => startListening()
    });
    if (!ok) startListening();
  }

  function startListening() {
    setPhase("listening");
    store.setSessionStatus("listening");
    setInterim("");
    if (textMode || micDenied) return;

    const handle = createRecognizer({
      onInterim: setInterim,
      onFinal: (text) => {
        setInterim("");
        handleUserAnswer(text);
      },
      onError: (kind) => {
        if (kind === "denied") {
          setMicDenied(true);
          setTextMode(true);
          notify("마이크 권한이 없어요. 글로 답해 주세요.");
        } else if (kind === "no-speech") {
          notify("소리가 들리지 않았어요. 다시 말씀해 주세요.");
        } else if (kind === "network") {
          notify("네트워크가 끊겼어요. 글로 답하거나 다시 시도해 주세요.");
        } else {
          notify("음성 인식에 실패했어요. 다시 시도해 주세요.");
        }
      }
    });
    recognizerRef.current = handle;
    if (!handle) {
      setTextMode(true);
      return;
    }
    handle.start();
  }

  function retryListening() {
    recognizerRef.current?.abort();
    startListening();
  }

  async function requestAiReply(turns: { speaker: "ai" | "user"; text: string }[]) {
    setPhase("thinking");
    setAiError("");
    const outcome = await converseReply(turns, category.label);
    if (!outcome.ok) {
      setAiError(outcome.error);
      setPendingReplyTurns(turns);
      return;
    }
    setPendingReplyTurns(null);
    store.appendTurn({ speaker: "ai", text: outcome.data });
    store.incrementFollowUp();
    runAiUtterance(outcome.data, false);
  }

  async function handleUserAnswer(text: string) {
    if (!text.trim() || !session) return;
    recognizerRef.current?.abort();
    store.appendTurn({ speaker: "user", text });
    setTextAnswer("");

    if (session.followUpCount >= MAX_FOLLOW_UPS) {
      setPhase("ending");
      return;
    }

    const turnsForAi = [...session.turns.map((t) => ({ speaker: t.speaker, text: t.text })), { speaker: "user" as const, text }];
    await requestAiReply(turnsForAi);
  }

  function submitTextAnswer() {
    if (!textAnswer.trim()) return;
    void handleUserAnswer(textAnswer.trim());
  }

  function pauseConversation() {
    recognizerRef.current?.abort();
    stopSpeaking();
    store.setSessionStatus("paused");
    setPhase("paused");
  }

  function replayLast() {
    if (!lastAiText) return;
    speak(lastAiText, { rate: state.recorderProfile.aiVoice.rate });
  }

  function endConversationNow() {
    recognizerRef.current?.abort();
    stopSpeaking();
    setPhase("ending");
  }

  async function goToSummary() {
    if (!session) return;
    setPhase("summarizing");
    const transcript = session.turns
      .filter((t) => t.speaker === "user")
      .map((t) => t.text)
      .join(" ");
    if (!transcript.trim()) {
      setPhase("summarizeFailed");
      setAiError("답변 내용이 없어서 정리할 수 없어요.");
      return;
    }
    const outcome = await summarizeMemory(transcript, session.mainQuestion);
    if (!outcome.ok) {
      setAiError(outcome.error);
      setPhase("summarizeFailed");
      return;
    }
    setReviewTitle(outcome.data.title);
    setReviewSummary(outcome.data.summary);
    setReviewTags(outcome.data.tags);
    setUnresolved(outcome.data.unresolved);
    setPhase("review");
  }

  function saveFallbackWithoutAi() {
    if (!session) return;
    const transcript = session.turns
      .filter((t) => t.speaker === "user")
      .map((t) => t.text)
      .join(" ");
    setReviewTitle(session.mainQuestion.slice(0, 16));
    setReviewSummary(transcript.slice(0, 80));
    setReviewTags([]);
    setUnresolved([]);
    setPhase("review");
  }

  function saveMemory() {
    if (!session) return;
    const transcript = session.turns
      .filter((t) => t.speaker === "user")
      .map((t) => t.text)
      .join("\n");
    store.saveMemory({
      category: category.label,
      question: session.mainQuestion,
      title: reviewTitle || session.mainQuestion.slice(0, 16),
      summary: reviewSummary,
      transcript,
      tags: reviewTags,
      visibility,
      visibleToMemberIds: visibility === "custom" ? customIds : [],
      unresolved,
      hasVoiceNote: !textMode,
      sessionId: session.id
    });
    notify("오늘의 기억을 안전하게 저장했어요.");
    onClose();
  }

  function abandon() {
    store.setSessionStatus("abandoned");
    onClose();
  }

  const familyMembers = state.family.members.filter((m) => m.role !== "recorder");

  if (phase === "prep") {
    return (
      <div className="screen">
        <button className="btn btn-text" onClick={onClose}>
          <ArrowLeft size={18} /> 나가기
        </button>
        <div className="mic-stage">
          <Mascot mood="calm" size={120} />
          <h2 style={{ font: "700 1.3rem 'Gowun Batang', serif", margin: 0, textAlign: "center" }}>
            {hasResumable ? "이어서 이야기할까요?" : `오늘은 ${category.label} 이야기를 나눠볼까요?`}
          </h2>
          <p className="mic-caption" style={{ textAlign: "center" }}>
            {hasResumable ? "24시간 안에는 이어서 답할 수 있어요." : question}
          </p>
          {hasResumable ? (
            <div className="btn-row" style={{ width: "100%" }}>
              <button className="btn btn-ghost" onClick={() => { store.clearSession(); setPhase("prep"); }}>
                새로 시작
              </button>
              <button className="btn btn-primary" onClick={resumeSession}>
                이어서 말하기
              </button>
            </div>
          ) : (
            <>
              <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={beginSession}>
                시작하기
              </button>
              <button
                className="btn btn-text"
                onClick={() => setCategoryIndex((i) => (i + 1) % QUESTION_CATEGORIES.length)}
              >
                원하지 않으면 다른 질문 고르기
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (phase === "review") {
    return (
      <div className="screen">
        <button className="btn btn-text" onClick={() => setPhase("ending")}>
          <ArrowLeft size={18} /> 뒤로
        </button>
        <div className="page-title">
          <small>MEMORY SAVE</small>
          <h1>오늘의 기억을 잘 담았어요</h1>
          <p>저장하기 전에 문장과 공개 범위를 바꿀 수 있어요.</p>
        </div>
        <div className="card">
          <label className="field">
            제목
            <input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} />
          </label>
          <label className="field" style={{ marginTop: 12 }}>
            요약
            <textarea value={reviewSummary} onChange={(e) => setReviewSummary(e.target.value)} style={{ minHeight: 70 }} />
          </label>
          {unresolved.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {unresolved.map((u, i) => (
                <span className="confirm-flag" key={i}>
                  확인 필요 · {u.note}
                </span>
              ))}
            </div>
          )}
          <div style={{ marginTop: 14 }}>
            <p className="helper-text" style={{ marginBottom: 6 }}>전문(원문)</p>
            <div className="transcript-block">
              {session?.turns.filter((t) => t.speaker === "user").map((t) => t.text).join("\n\n")}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <p className="card-label">공개 범위</p>
          <div className="segmented" style={{ marginTop: 10 }}>
            {(["family", "private", "custom"] as const).map((v) => (
              <button key={v} className={visibility === v ? "active" : ""} onClick={() => setVisibility(v)}>
                {{ family: "가족 전체", private: "나만 보기", custom: "선택 가족" }[v]}
              </button>
            ))}
          </div>
          {visibility === "custom" && (
            <div className="choice-group" style={{ marginTop: 12 }}>
              {familyMembers.map((m) => (
                <button
                  key={m.id}
                  className={`choice-card ${customIds.includes(m.id) ? "selected" : ""}`}
                  onClick={() =>
                    setCustomIds((cur) => (cur.includes(m.id) ? cur.filter((id) => id !== m.id) : [...cur, m.id]))
                  }
                >
                  <strong>
                    {m.relationship} {m.displayName}
                  </strong>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-primary btn-lg" style={{ marginTop: 16 }} onClick={saveMemory}>
          <Check size={20} /> 기억 저장
        </button>
      </div>
    );
  }

  if (phase === "summarizing") {
    return (
      <div className="mic-stage" style={{ minHeight: "70vh" }}>
        <Mascot mood="calm" size={100} />
        <p className="mic-caption">오늘의 이야기를 정리하고 있어요…</p>
      </div>
    );
  }

  if (phase === "summarizeFailed") {
    return (
      <div className="screen">
        <div className="empty">
          <strong>정리에 실패했어요</strong>
          <p>{aiError || "AI 생성에 실패했어요."}</p>
          <div className="btn-row" style={{ marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={saveFallbackWithoutAi}>
              원문 그대로 저장
            </button>
            <button className="btn btn-primary" onClick={goToSummary}>
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "ending") {
    return (
      <div className="screen">
        <div className="mic-stage">
          <Mascot mood="happy" size={110} />
          <h2 style={{ font: "700 1.2rem 'Gowun Batang', serif", margin: 0 }}>오늘 이야기는 여기까지 할까요?</h2>
          <div className="btn-row" style={{ width: "100%" }}>
            <button className="btn btn-ghost" onClick={() => startListening()}>
              조금 더 말하기
            </button>
            <button className="btn btn-primary" onClick={goToSummary}>
              내용 확인하기
            </button>
          </div>
          <button className="btn btn-text" onClick={abandon}>
            저장하지 않고 나가기
          </button>
        </div>
      </div>
    );
  }

  const mood: MascotMood = phase === "greeting" ? "speaking" : phase === "thinking" ? "calm" : "listening";
  const captionText =
    phase === "thinking"
      ? "말씀을 듣고 다음 질문을 준비하고 있어요…"
      : phase === "paused"
        ? "일시정지했어요. 다시 시작을 눌러주세요."
        : interim || (phase === "listening" ? "편하게 말씀해 주세요." : lastAiText);

  return (
    <div className="screen">
      <button className="btn btn-text" onClick={endConversationNow}>
        <X size={18} /> 종료
      </button>

      <div className="mic-stage">
        <div className={`mic-orb ${phase === "greeting" ? "speaking" : phase === "listening" ? "listening" : ""}`}>
          <Mascot mood={mood} size={72} />
        </div>
        <div className="caption-live">{captionText}</div>

        {aiError && (
          <div className="empty" style={{ minHeight: "auto" }}>
            <p style={{ color: "var(--error)" }}>{aiError}</p>
            <button className="btn btn-secondary" onClick={() => pendingReplyTurns && void requestAiReply(pendingReplyTurns)}>
              다시 시도
            </button>
          </div>
        )}

        {textMode && phase === "listening" && (
          <div className="choice-group" style={{ width: "100%" }}>
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="이곳에 답을 적어주세요."
            />
            <button className="btn btn-primary" onClick={submitTextAnswer}>
              답 전달하기
            </button>
          </div>
        )}

        <div className="control-row">
          {phase === "paused" ? (
            <button className="control-btn" onClick={resumeSession}>
              <Play size={18} /> 다시 시작
            </button>
          ) : (
            <button className="control-btn" onClick={pauseConversation}>
              <Pause size={18} /> 잠시 멈춤
            </button>
          )}
          <button className="control-btn" onClick={replayLast}>
            <RotateCcw size={18} /> 다시 듣기
          </button>
          {!textMode && phase === "listening" && (
            <button className="control-btn" onClick={retryListening}>
              <Square size={18} /> 다시 말하기
            </button>
          )}
          <button className="control-btn danger" onClick={endConversationNow}>
            <X size={18} /> 오늘은 그만하기
          </button>
        </div>

        {!isSynthesisSupported() && <p className="helper-text">이 기기에서는 음성 읽어주기를 지원하지 않아요. 화면 자막으로 진행해요.</p>}
      </div>
    </div>
  );
}
